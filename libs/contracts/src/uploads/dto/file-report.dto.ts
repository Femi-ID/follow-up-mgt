import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { SheetReportDto } from "./sheet-report.dto";

export class FileReportDto {
    @IsString()
    @IsNotEmpty()
    fileName: string;

    @IsString()
    @IsNotEmpty()
    filePath: string;

    @IsArray()
    sheets: SheetReportDto[]
}