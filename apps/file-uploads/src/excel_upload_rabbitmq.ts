// // ================================================
// // 📦 NestJS Microservice Architecture Overview
// // ================================================
// // Feature: Excel file upload → DB save → Report Generation (PDF/Graph/Excel)
// // Async via RabbitMQ (Offload heavy work)

// // ================================================
// // ✅ 1. Required Libraries
// // ================================================
// // npm install --save @nestjs/microservices @nestjs/platform-express multer xlsx exceljs pdfkit amqplib class-transformer class-validator
// // npm install --save-dev @types/multer

// // ================================================
// // ✅ 2. FileUploadModule (API Gateway - HTTP Entry Point)
// // ================================================

// // upload.controller.ts
// import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
// import { join } from 'path';
// import { readFile, utils } from 'xlsx';
// import { createReadStream } from 'fs';
// import { MessagePattern, Payload } from '@nestjs/microservices';

// @Controller('upload')
// export class UploadController {
//   private fileProcessorClient: ClientProxy;

//   constructor() {
//     this.fileProcessorClient = ClientProxyFactory.create({
//       transport: Transport.RMQ,
//       options: {
//         urls: ['amqp://localhost:5672'],
//         queue: 'file_processing_queue',
//       },
//     });
//   }

//   @Post()
//   @UseInterceptors(FileInterceptor('file'))
//   async uploadExcel(@UploadedFile() file: Express.Multer.File) {
//     const workbook = readFile(file.path);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const jsonData = utils.sheet_to_json(sheet);

//     await this.fileProcessorClient.emit('process_excel_data', jsonData);

//     return {
//       message: 'Upload received. File is being processed.',
//     };
//   }
// }

// // ================================================
// // ✅ 3. FileProcessorService (Microservice Worker)
// // ================================================

// // processor.service.ts
// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { DocumentModel, DocumentSchema } from './schema/document.schema';
// import { MessagePattern, Payload } from '@nestjs/microservices';

// @Injectable()
// export class ProcessorService {
//   constructor(
//     @InjectModel(DocumentModel.name)
//     private documentModel: Model<DocumentModel>,
//   ) {}

//   @MessagePattern('process_excel_data')
//   async handleFileUpload(@Payload() data: Record<string, any>[]) {
//     for (const row of data) {
//       const doc = new this.documentModel(row);
//       await doc.save();
//     }
//   }
// }

// // ================================================
// // ✅ 4. Report Generation Service
// // ================================================
// // Generates reports (PDF, Excel, Graphs)

// // report.service.ts
// import { Injectable } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import * as PDFDocument from 'pdfkit';
// import * as ExcelJS from 'exceljs';
// import { DocumentModel } from './schema/document.schema';
// import * as fs from 'fs';

// @Injectable()
// export class ReportService {
//   constructor(
//     @InjectModel(DocumentModel.name)
//     private docModel: Model<DocumentModel>,
//   ) {}

//   async generateMonthlyPDFReport(month: number, year: number): Promise<Buffer> {
//     const start = new Date(year, month - 1, 1);
//     const end = new Date(year, month, 0);
//     const records = await this.docModel.find({ createdAt: { $gte: start, $lte: end } });

//     const doc = new PDFDocument();
//     const chunks: any[] = [];
//     doc.on('data', (chunk) => chunks.push(chunk));
//     doc.on('end', () => {});

//     doc.text(`Monthly Report: ${month}/${year}\n\n`);
//     records.forEach((r) => {
//       doc.text(`Name: ${r.name}, Age Group: ${r.ageGroup}, Email: ${r.email}`);
//     });

//     doc.end();
//     return new Promise((resolve) => {
//       doc.on('end', () => resolve(Buffer.concat(chunks)));
//     });
//   }

//   async generateExcelReportWithBarChart(): Promise<Buffer> {
//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet('Report');
//     sheet.columns = [
//       { header: 'Name', key: 'name' },
//       { header: 'Email', key: 'email' },
//       { header: 'Age Group', key: 'ageGroup' },
//     ];
//     const records = await this.docModel.find();
//     records.forEach((r) => sheet.addRow(r));

//     const buffer = await workbook.xlsx.writeBuffer();
//     return buffer;
//   }
// }

// // ================================================
// // ✅ 5. Schema (document.schema.ts)
// // ================================================

// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// @Schema({ timestamps: true })
// export class DocumentModel extends Document {
//   @Prop() name: string;
//   @Prop() address: string;
//   @Prop() ageGroup: string;
//   @Prop() email: string;
//   @Prop() phoneNumber: string;
// }

// export const DocumentSchema = SchemaFactory.createForClass(DocumentModel);

// // ================================================
// // 🧑‍🏫 Explanation (for Interns)
// // ================================================
// // 1. User uploads Excel → Gateway reads + converts to JSON.
// // 2. JSON is sent via RabbitMQ to `file_processing_queue`.
// // 3. The processor service listens, receives the data, and saves each row.
// // 4. Separate service (ReportService) can generate filtered PDFs or Excel.
// // 5. Bar charts can be created using frontend Chart.js or embedded into PDFs via puppeteer.

// // Let me know if you want the full Docker + RabbitMQ + MongoDB setup too.



// const headerMap: Record<string, number> = {};
//         headerRow.forEach((header, index) => {
//           if (this.ALLOWED_FIELDS.includes(header.toLowerCase())) {
//             headerMap[header] = index;
//           }
//         });
//         console.log(`type of headerMap for sheet1? :${typeof headerMap}`)
//         console.log(`header Map for sheet1? : ${headerMap[0]?.['row']}` ) // find the structure of headerMap
//         const headerV = headerMap[0]?.['row'] || {};
//         const headerValue = Object.values(headerV);
//         console.log(`headerMap value : ${headerValue}`)


//   private readonly ALLOWED_FIELDS = [
//   'name',
//   'address',
//   'phoneNumber',
//   'email',
//   'gender',
//   'ageGroup',
//   'response',
//   'member',
//   'filename',
//   'sheetname'
// ];

// private readonly REQUIRED_FIELDS = [
//   'name',
//   'address',
//   'phoneNumber',
//   'gender',
//   'ageGroup',
//   'response'
// ];


// **********************************88
// async validateExcelFileRows(jsonRows, filename: string, sheetname: string, headerMap): Promise<ExcelRowDto[]> {
//   const validatedRows: ExcelRowDto[] = [];

//   for (let i = 0; i < jsonRows.length; i++) {
//     const row = jsonRows[i]?.['row'] || {};
//     const arrayOfRow = Object.values(row);

//     if (!row || Object.keys(row).length === 0) {
//       console.warn(`Row ${i} is empty or invalid.`);
//       continue;
//     }

//     // 🔑 Filter only allowed fields
//     const filteredRow = Object.keys(row)
//       .filter((key) => this.ALLOWED_FIELDS.includes(key))
//       .reduce((acc, key) => {
//         acc[key] = row[key];
//         return acc;
//       }, {} as any);

//     // 🔑 Enforce required fields
//     const missingRequired = this.REQUIRED_FIELDS.filter((field) => !filteredRow[field] || filteredRow[field] === '');
//     if (missingRequired.length > 0) {
//       console.warn(`Row ${i} skipped. Missing required fields: ${missingRequired.join(', ')}`);
//       continue;
//     }

//     const dto = plainToInstance(ExcelRowDto, {
//       name: arrayOfRow[headerMap['name']] ?? '',
//       address: arrayOfRow[headerMap['address']] ?? '',
//       phoneNumber: arrayOfRow[headerMap['phoneNumber']] ?? '',
//       email: typeof arrayOfRow[headerMap['email']] === 'string'
//         ? (arrayOfRow[headerMap['email']] as string).toLowerCase()
//         : '',
//       gender: arrayOfRow[headerMap['gender']] ?? '',
//       ageGroup: arrayOfRow[headerMap['ageGroup']] ?? '',
//       response: arrayOfRow[headerMap['response']] ?? '',
//       member: arrayOfRow[headerMap['member']] === 'true',
//       fileName: filename,
//       sheetName: sheetname,
//     });
//     // const dto = plainToInstance(ExcelRowDto, {
//     //   ...filteredRow,
//     //   email: typeof filteredRow.email === 'string' ? filteredRow.email.trim().toLowerCase() : undefined,
//     //   fileName: filename,
//     //   sheetName: sheetname,
//     // });

//     if (dto.email === '') delete dto.email;

//     const errors = await validate(dto);
//     if (errors.length > 0) {
//       console.warn(`Validation errors for row ${i}: `, errors);
//       continue;
//     }

//     validatedRows.push(dto);
//   }

//   return validatedRows;
// }