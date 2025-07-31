import { ExcelRowDto } from '@app/contracts/uploads/dto/excelRow.dto';
import { FileProcessingPayload } from '@app/contracts/uploads/dto/file-uploads.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { validate } from 'class-validator';
import * as fs from 'fs';
import { promisify } from 'util';
import * as XLSX from 'xlsx';
import { plainToInstance } from 'class-transformer';
import { InjectModel } from '@nestjs/mongoose';
import { NewGuest } from './schemas/new-guests.schema';
import { Model } from 'mongoose';
import { stringify } from 'querystring';

const unlinkAsync = promisify(fs.unlink);

@Injectable()
export class FileUploadsService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  @InjectModel(NewGuest.name) private newGuestModel: Model<NewGuest>) {}

  async convertExcelFileToJson(payload: FileProcessingPayload) {
    try {
      const fileBuffer = fs.readFileSync(payload.filePath);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

      const headers = [
        'name',
        'address',
        'phoneNumber',
        'email',
        'gender',
        'ageGroup',
        'response'
      ];

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: headers, range: 1, defval: '', blankrows: false});
      const jsonDocuments = jsonData.map((row) => ({row}));

      const headerRow = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: 0, raw: true})[0] as string[];
      const expectedHeaders = ['name', 'address', 'phoneNumber', 'email', 'gender', 'ageGroup', 'response'];
      const missingHeaders = expectedHeaders.filter(h => !headerRow.includes(h));
      if (missingHeaders.length > 0) {
        throw new RpcException(`Missing headers in the Excel file: ${missingHeaders.join(', ')}`);
      }

      console.log('File converted to json.', payload.filePath, typeof payload.filePath,);
      // console.log('json Documents::', jsonDocuments)
      console.log('count: ', jsonDocuments.length)
      return await this.uploadJsonFileToDB(jsonDocuments, payload.filePath);
    } catch (err) {
      console.error('Error processing file: ', err);
      throw new RpcException('Error processing file');
    }
  }

  async uploadJsonFileToDB(jsonDocuments: any[], filePath: string) {
    // validate each row in the Excel file
      const validatedRows = await this.validateExcelFileRows(jsonDocuments);
      if (validatedRows.length === 0) {
        throw new RpcException('No valid rows found in the Excel file.');
      }
      await this.insertJsonIntoDB(validatedRows)
      await this.deleteJsonFileFromCache([filePath]) // Delete the file after processing
  }

  async validateExcelFileRows(jsonRows): Promise<ExcelRowDto[]> {
    const validatedRows: ExcelRowDto[] = [];
    for (let i = 0; i < jsonRows.length; i++) {
      const row = jsonRows[i]?.['row'] || {};
      const arrayOfRow = Object.values(row);

      if (!Object.values(row) || Object.values(row).length == 0) {
        console.warn(`Row ${i} is empty or invalid.`);
        continue; // skip empty/invalid rows
      }
      console.log('row:::', row.email, 'type:', typeof row.email)
      console.log('arrayOfRow[3]:: ', arrayOfRow[3], 'type:', typeof arrayOfRow[3])

      const dto = plainToInstance(ExcelRowDto, {
        name: arrayOfRow[0] ?? '',
        address: arrayOfRow[1] ?? '',
        phoneNumber: arrayOfRow[2] ?? '',
        email: typeof arrayOfRow[3] === 'string' ? arrayOfRow[3].toLowerCase(): (arrayOfRow[3] ?? ''),
        gender: typeof arrayOfRow[4] === 'string' ? arrayOfRow[4].toLowerCase(): '',
        ageGroup: arrayOfRow[5] ?? '',
        response: typeof arrayOfRow[6] === 'string' ? arrayOfRow[6].toString().toLowerCase(): '',
        member: arrayOfRow[7] === 'true' ? true: false,
      });

      dto.email = dto.email?.trim();
      if (dto.email === '') {
        delete dto.email;
      }
      const errors = await validate(dto);
      if (errors.length > 0) { // Logs invalid rows for the excel file
        console.warn('Validation errors for these rows: ', errors)
        continue; 
        // future feat: return an array of invalid rows with a successful message for the valid rows
      }
      validatedRows.push(dto)
    }
    return validatedRows;
  }

  async insertJsonIntoDB(validatedRows: any[]) {
    return await this.newGuestModel.insertMany(validatedRows);
  }

  async deleteJsonFileFromCache(validatedRows: string[]) {
    await unlinkAsync(validatedRows[0]);
    console.log('File deleted from cache: ', validatedRows[0]);
    return { message: 'File deleted from cache.' };
  }

  async exampleUpload(name: string, age: number) {
    console.log('from uploads gateway uploads-service::', `${name}-${age}`);
    return { file: 'file received', name: name, age: age };
    // return { file: 'file received', fileName: file.originalname, mimetype: file.mimetype}
  }
}
