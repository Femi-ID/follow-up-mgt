import { AgeGroup } from "apps/file-uploads/src/enums/age-group.enum";
import { ResponseStatus } from "apps/file-uploads/src/enums/responseStatus.enum";
import { IsBoolean, IsEnum, IsISO8601, IsOptional, IsString, Matches } from "class-validator";

export enum AnalyticsGroupByUnit {
    DAY = 'day',
    WEEK = 'week',
    MONTH = 'month',
}

export class QueryAnalyticsDto {
    // The time unit to group the results by. ex: 'day', 'week', or 'month'
    @IsOptional()
    @IsEnum(AnalyticsGroupByUnit, {message: 'groupByUnit must be one of the AnalyticsGroupByUnit enum values'})
    groupByUnit?: AnalyticsGroupByUnit;

    // Must be a full ISO8601 string or "YYYY-MM-DD"
    @IsOptional()
    @IsISO8601()
    startDate?: string

    @IsOptional()
    @IsISO8601()
    endDate?: string

    @IsOptional()
    @Matches(/^\d{4}-\d{2}$/, { message: 'startMonth must be in YYYY-MM format'})
    startMonth?: string

    @IsOptional()
    @Matches(/^\d{4}-\d{2}$/, { message: 'endMonth must be in YYYY-MM format'})
    endMonth?: string

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    @IsEnum(AgeGroup, { message: 'value must be one of the choices listed in the AgeGroup enum.',})
    ageGroup?: AgeGroup;

    @IsOptional()
    @IsBoolean()
    member?: boolean;

    @IsOptional()
    @IsString()
    @IsEnum(ResponseStatus, {message: 'value must be one of the choices listed in the ResponseStatus enum.', })
    response?: ResponseStatus;
}