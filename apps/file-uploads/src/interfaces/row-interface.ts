import { ExcelRowDto } from "@app/contracts/uploads/dto/excelRow.dto";

export interface RowValidationResult {
    isValid: boolean;
    rowIndex: number;
    errors?: string[];
    data?: ExcelRowDto;
}