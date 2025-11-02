import { AgeGroup } from "apps/file-uploads/src/enums/age-group.enum";
import { ResponseStatus } from "apps/file-uploads/src/enums/responseStatus.enum";
import { Type } from "class-transformer";
import { IsBoolean, IsEmail, IsEnum, IsInt, IsISO8601, IsNumber, IsOptional, IsString, Matches, Max, Min } from "class-validator";

export class QueryGuestsDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsBoolean()
    member?: boolean;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    @IsEnum(AgeGroup, { message: 'value must be one of the choices listed in the AgeGroup enum.',})
    ageGroup?: AgeGroup;

    @IsOptional()
    @IsString()
    @IsEnum(ResponseStatus, {message: 'value must be one of the choices listed in the ResponseStatus enum.', })
    response?: ResponseStatus;

    @IsISO8601() //  validator accepts 'YYYY-MM-DD' as a valid ISO 8601 string
    @IsOptional()
    serviceDate?: string;

    @IsISO8601()  // e.g- 2025-10-12
    @IsOptional()
    startDate?: string;


    @IsISO8601() 
    @IsOptional()
    endDate?: string;

    // month based filter
    @IsOptional()
    @Matches(/^\d{4}-\d{2}$/, { message: 'Month must be in YYYY-MM format'})
    month?: string // "2025-10"

    @IsOptional()
    @Matches(/^\d{4}-\d{2}$/, { message: 'Start month must be in YYYY-MM format'})
    startMonth?: string // "2025-10"

    @IsOptional()
    @Matches(/^\d{4}-\d{2}$/, { message: 'End month must be in YYYY-MM format'})
    endMonth?: string // "2025-10"

    // year based filter
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    @Max(2100)
    year?: number; // 2025

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    @Max(2100)
    startYear?: number; // 2025

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    @Max(2100)
    endYear?: number; // 2025

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number;
}