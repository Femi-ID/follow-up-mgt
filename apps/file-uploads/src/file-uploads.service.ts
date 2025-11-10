import { ExcelRowDto } from '@app/contracts/uploads/dto/excelRow.dto';
import { FileProcessingPayload } from '@app/contracts/uploads/dto/file-uploads.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { validate, ValidationError } from 'class-validator';
import * as fs from 'fs';
import { promisify } from 'util';
import * as XLSX from 'xlsx';
import { plainToInstance } from 'class-transformer';
import { InjectModel } from '@nestjs/mongoose';
import { NewGuest } from './schemas/new-guests.schema';
import { Model } from 'mongoose';
import { FileReportDto } from '@app/contracts/uploads/dto/file-report.dto';
import { SheetReportStatus } from './enums/sheet-report-status.dto';
import { RowValidationResult } from './interfaces/row-interface';
import { ColumnMapping } from './interfaces/column-interface';


const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class FileUploadsService {
  private readonly logger = new Logger(FileUploadsService.name); // to debug and log service activity
  private readonly REQUIRED_SCHEMA_FIELDS = [
    'name',
    'address',
    'phoneNumber',
    'gender',
    'ageGroup',
    'response'
  ];
  private readonly OPTIONAL_SCHEMA_FIELDS = ['email', 'member'];
  private readonly ALL_SCHEMA_FIELDS = [
    ...this.REQUIRED_SCHEMA_FIELDS,
    ...this.OPTIONAL_SCHEMA_FIELDS
  ];

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectModel(NewGuest.name) private newGuestModel: Model<NewGuest>
  ) {}

  // This function is NOW NOT NEEDED! Kept for reference
  // async processMultipleExcelFiles(payload: FileProcessingPayload[]) {
  //   const results = [];
  //   for (const file of payload) {
  //     try {
  //       const result = await this.convertExcelFileToJson(file);
  //       results.push(result);
  //     } catch (error) {
  //       this.logger.error(
  //         `Failed to process file ${file.originalname}: ${error.message}`
  //       );
  //       results.push({ fileName: file.originalname, error: error.message });
  //     }
  //   }
  //   return results;
  // }

  async convertExcelFileToJson(payload: FileProcessingPayload, serviceDate?: string) {
    try {
      // To read the Excel file into memory
      const fileBuffer = fs.readFileSync(payload.filePath);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

      // To initialize report structure to track processing results
      const fileReport: FileReportDto = {
        fileName: payload.originalname,
        filePath: payload.filePath,
        sheets: [],
      };

      const allValidatedRows: ExcelRowDto[] = [];

      // Process each sheet in the workbook
      for (const sheetName of workbook.SheetNames) {
        this.logger.log(`Processing sheet: ${sheetName} in ${payload.originalname}`);

        const worksheet = workbook.Sheets[sheetName];

        // To get the first row which is the header row
        const rawHeaderRow = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: 0,
          raw: true,
        })[0] as string[];

        // Normalize headers: trim whitespace and convert to lowercase for matching
        const normalizedHeaders = (rawHeaderRow || []).map((h) =>
          h ? String(h).trim().toLowerCase() : ''
        );
        this.logger.debug(`Normalized headers: ${JSON.stringify(normalizedHeaders || [])}`)

        // To map schema fields to their column indices in Excel in case they're not in order
        const columnMapping = this.createColumnMapping(normalizedHeaders);

        // Check if all required fields from schema are present in Excel file
        const missingRequiredFields = this.REQUIRED_SCHEMA_FIELDS.filter(
          (field) => columnMapping[field] === undefined
        );

        if (missingRequiredFields.length > 0) {
          this.logger.warn(
            `Skipping sheet '${sheetName}' - Missing required columns: ${missingRequiredFields.join(', ')}`
          );
          fileReport.sheets.push({
            sheetName,
            validatedRows: 0,
            invalidRows: 0,
            status: SheetReportStatus.SKIPPED,
            fileName: payload.originalname,
            message: `Missing required columns: ${missingRequiredFields.join(', ')}`,
          });
          continue; // Skip this sheet
        }

        // To extract data rows
        const rawDataRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          range: 1,
          defval: '',
          blankrows: false,
        }) as string[][];

        // Validate and transform each row
        const validationResults = await this.validateExcelFileRows(
          rawDataRows,
          columnMapping,
          payload.originalname,
          sheetName,
          serviceDate
        );

        // Separate valid rows from invalid ones
        const validRows = validationResults
          .filter((result) => result.isValid)
          .map((result) => result.data);

        const invalidCount = validationResults.filter(
          (result) => !result.isValid
        ).length;

        // Update sheet report
        fileReport.sheets.push({
          sheetName,
          validatedRows: validRows.length,
          invalidRows: invalidCount,
          status:
            validRows.length === rawDataRows.length
              ? SheetReportStatus.SUCCESS
              : validRows.length > 0
              ? SheetReportStatus.PARTIAL
              : SheetReportStatus.SKIPPED,
          fileName: payload.originalname,
          message:
            invalidCount > 0
              ? `${invalidCount} row(s) failed validation. Check logs for details.`
              : undefined,
        });

        allValidatedRows.push(...validRows);
      }

      // To log final report
      this.logger.log(
        `File processing complete for ${payload.originalname}: ${allValidatedRows.length} valid rows across ${fileReport.sheets.length} sheet(s)`
      );
      this.logger.log('File Report:', JSON.stringify(fileReport, null, 2));

      if (allValidatedRows.length === 0) {
        throw new RpcException(
          `No valid rows found in ${payload.originalname}. Check that required columns exist and data is valid.`
        );
      }

      // Save to database and cleanup
      return await this.uploadJsonFileToDB(
        allValidatedRows,
        payload.filePath,
        fileReport
      );
    } catch (err) {
      this.logger.error(`Error processing file ${payload.originalname}:`, err.stack);
      // Attempt to clean up the file even on failure
      await this.deleteFileFromDisk(payload.filePath);
      throw new RpcException(
        `Failed to process file ${payload.originalname}: ${err.message}`
      );
    }
  }

  //   Creates a mapping between schema field names and Excel column indices
  private createColumnMapping(normalizedHeaders: string[]): ColumnMapping {
    const mapping: ColumnMapping = {};

    normalizedHeaders.forEach((header, index) => {
      // Skip blank headers
      if (!header || header.trim() === '') {
        this.logger.debug(`Skipping blank column at index ${index}`);
        return;
      }

      // To check if this header matches any schema field
      const matchingField = this.ALL_SCHEMA_FIELDS.find(
        (field) => field.toLowerCase() === header.toLowerCase().trim()
      );

      if (matchingField) {
        mapping[matchingField] = index;
        this.logger.debug(`Mapped column "${header}" (index ${index}) to field "${matchingField}"`);
      } else {
        this.logger.debug(
          `Skipping unknown column "${header}" at index ${index} - not in schema`
        );
      }
    });
    return mapping;
  }

  /**
   * Validates each row of data from the Excel file
   * Uses the column mapping to extract data in correct order
   * 
   * VALIDATION PROCESS:
   * 1. Use column mapping to extract values from correct positions
   * 2. Handle missing optional fields gracefully
   * 3. Transform data to correct types (strings, booleans, enums)
   * 4. Use class-validator to check business rules
   * 5. Log specific validation errors for debugging
   */
  private async validateExcelFileRows(
    rawDataRows: any[][],
    columnMapping: ColumnMapping,
    fileName: string,
    sheetName: string,
    serviceDate?: string
  ): Promise<RowValidationResult[]> {
    const results: RowValidationResult[] = [];

    for (let i = 0; i < rawDataRows.length; i++) {
      const rowIndex = i + 2; // +2 because: +1 for 0-index, +1 for header row (i starts at 0, index in columnMapping starts at 0, header is row 1)
      const rawRow = rawDataRows[i];

      // Skip completely empty rows
      if (!rawRow || rawRow.length === 0 || rawRow.every((cell) => !cell)) {
        this.logger.debug(`Row ${rowIndex}: Skipping empty row`);
        results.push({
          isValid: false,
          rowIndex,
          errors: ['Empty row'],
        });
        continue;
      }

      try {
        /**
         * Extract values using column mapping
         * This handles columns not in expected order
         * 
         * For each schema field, we look up its column index from mapping
         * then extract the value from that position in the raw row
         */
        const extractedData: any = {};

        // Extract each field using the mapping
        for (const field of this.ALL_SCHEMA_FIELDS) {
          const columnIndex = columnMapping[field];

          // If field exists in Excel, extract its value
          if (columnIndex !== undefined) {
            let value = rawRow[columnIndex];

            // Normalize value: handle various Excel data types
            if (value === null || value === undefined || value === '') {
              value = undefined; // Treat empty cells as undefined
            } else if (typeof value === 'string') {
              value = value.trim(); // Remove whitespace
              // Convert to lowercase for enum fields to match validation
              if (['gender', 'response'].includes(field)) {
                value = value.toLowerCase();
              }
              // Special handling for email
              if (field === 'email') {
                value = value.toLowerCase();
                // If email is empty string after trim, set to undefined
                if (value === '') {
                  value = undefined;
                }
              }
              
            } else if (field === 'member') {
              // Handle boolean conversion for 'member' field
              value = this.convertToBoolean(value);
            }

            extractedData[field] = value;
          }
          // If field doesn't exist in Excel:
          // - Required fields will fail validation later
          // - Optional fields will remain undefined (which is fine)
        }

        // To add metadata fields
        extractedData.fileName = fileName;
        extractedData.sheetName = sheetName;
        if (serviceDate) {
          this.logger.debug(`serviceDate provided: ${serviceDate}`)
          extractedData.serviceDate = serviceDate;
        } 
        // extractedData.serviceDate = "2025-10-12"

        //  Transform plain object to DTO instance
        const dto = plainToInstance(ExcelRowDto, extractedData, {
          excludeExtraneousValues: false,
          exposeUnsetFields: false,
        });

        const errors = await validate(dto, {
          whitelist: true, // Strip properties that don't have decorators
          forbidNonWhitelisted: false, // Don't throw on extra properties
        });

        if (errors.length > 0) {
          const errorMessages = this.formatValidationErrors(errors);
          this.logger.warn(
            `Row ${rowIndex} validation failed: ${errorMessages.join('; ')}`
          );

          results.push({
            isValid: false,
            rowIndex,
            errors: errorMessages,
          });
        } else {
          // Validation successful
          results.push({
            isValid: true,
            rowIndex,
            data: dto,
          });
        }
      } catch (error) {
        this.logger.error(
          `Row ${rowIndex} processing error: ${error.message}`,
          error.stack
        );
        results.push({
          isValid: false,
          rowIndex,
          errors: [`Processing error: ${error.message}`],
        });
      }
    }

    return results;
  }


  private convertToBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      return normalized === 'true' || normalized === 'yes' || normalized === '1';
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    return false;
  }


  private formatValidationErrors(errors: ValidationError[]): string[] {
    return errors.flatMap((error) => {
      if (error.constraints) {
        // Each constraint is a key-value pair: { isEmail: "email must be an email" }
        return Object.values(error.constraints).map(
          (msg) => `${error.property}: ${msg}`
        );
      }
      return [`${error.property}: validation failed`];
    });
  }


  async uploadJsonFileToDB(
    allValidatedRows: ExcelRowDto[],
    filePath: string,
    fileReport: FileReportDto
  ) {
    try {
      // Insert all validated rows in one operation
      const result = await this.insertJsonIntoDB(allValidatedRows);
      this.logger.log(`Successfully inserted ${result.length} records into database`);

      // Clean up the temporary file
      await this.deleteFileFromDisk(filePath);

      return {
        success: true,
        report: fileReport,
        insertedCount: result.length,
      };
    } catch (error) {
      this.logger.error('Database insertion failed:', error.stack);
      // Still try to delete the file even if insertion failed
      try {
        await this.deleteFileFromDisk(filePath);
      } catch (deleteError) {
        this.logger.error('Failed to delete file after error:', deleteError.message);
      }
      throw new RpcException(`Database insertion failed: ${error.message}`);
    }
  }


  private async insertJsonIntoDB(validatedRows: ExcelRowDto[]) {
    return await this.newGuestModel.insertMany(validatedRows, {
      ordered: false, // Continue inserting even if some documents fail (e.g., duplicate emails)
    });
  }


  private async deleteFileFromDisk(filePath: string) {
    try {
      await unlinkAsync(filePath);
      this.logger.log(`File deleted: ${filePath}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${filePath}:`, error.message);
    }
  }


  async exampleUpload(name: string, age: number) {
    return { file: 'file received', name, age };
  }
}