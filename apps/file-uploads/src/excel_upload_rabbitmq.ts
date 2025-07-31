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
