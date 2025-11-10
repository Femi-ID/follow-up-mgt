import { AgeGroup } from 'apps/file-uploads/src/enums/age-group.enum';
import { Gender } from 'apps/file-uploads/src/enums/gender.enums';
import { ResponseStatus } from 'apps/file-uploads/src/enums/responseStatus.enum';
import { IsBoolean, IsEmail, IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';


export class UpdateGuestDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  @IsBoolean()
  member?: boolean;

  @IsEnum(Gender, { message: 'value must be one of the choices listed in the Gender enum.',})
  @IsOptional()
  gender?: Gender;

  @IsEnum(AgeGroup, { message: 'value must be one of the choices listed in the AgeGroup enum.',})
  @IsOptional()
  ageGroup?: AgeGroup;

  @IsEnum(ResponseStatus, {message: 'value must be one of the choices listed in the ResponseStatus enum.', })
  @IsOptional()
  response?: ResponseStatus;

  // @IsDateString()
  // @IsNotEmpty()
  // serviceDate: Date;

  @IsISO8601() // Validates a string like "2025-10-20T09:00:00.000Z"
  @IsOptional()
  serviceDate?: string;
}
