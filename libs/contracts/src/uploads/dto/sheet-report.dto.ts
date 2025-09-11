import { SheetReportStatus } from "apps/file-uploads/src/enums/sheet-report-status.dto";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class SheetReportDto {
    @IsString()
    @IsNotEmpty()
    sheetName: string;

    @IsNumber()
    @IsNotEmpty()
    validatedRows: number;

    @IsNumber()
    @IsNotEmpty()
    invalidRows: number;

    @IsNotEmpty()
    @IsEnum(SheetReportStatus, { message: 'value must be one of the choices listed in the SheetReportStatus enum.' })
    status: SheetReportStatus;

    @IsString()
    @IsOptional()
    message?: string;

    @IsString()
    @IsNotEmpty()
    fileName: string;
}