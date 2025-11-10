import { AgeGroup } from "apps/file-uploads/src/enums/age-group.enum";
import { Gender } from "apps/file-uploads/src/enums/gender.enums";
import { ResponseStatus } from "apps/file-uploads/src/enums/responseStatus.enum";
import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsEmail, IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ExcelRowDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsBoolean()
  member?: boolean;

  @IsEnum(Gender, { message: 'value must be one of the choices listed in the Gender enum.' })
  gender: Gender;

  @IsEnum(AgeGroup, { message: 'value must be one of the choices listed in the AgeGroup enum.' })
  ageGroup: AgeGroup;

  @IsEnum(ResponseStatus, { message: 'value must be one of the choices listed in the ResponseStatus enum.' })
  response: ResponseStatus;

  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  sheetName: string;

  // @IsISO8601() // Validates a string like "2025-10-20T09:00:00.000Z"
  @IsDate()
  @IsOptional()
  @Type(() => Date) // This tells class-transformer (plainToInstance) to convert the incoming value (the string) into a Date object
  serviceDate: string;
}