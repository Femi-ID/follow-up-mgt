import { AgeGroup } from "apps/file-uploads/src/enums/age-group.enum";
import { Gender } from "apps/file-uploads/src/enums/gender.enums";
import { ResponseStatus } from "apps/file-uploads/src/enums/responseStatus.enum";
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

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

  @IsString()
  fileName: string;

  @IsString()
  sheetName: string;
}