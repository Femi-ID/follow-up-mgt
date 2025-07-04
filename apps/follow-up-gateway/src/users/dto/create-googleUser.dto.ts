import { Role } from 'apps/users/src/enums/roles.enums';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGoogleUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  email: string;

//   @IsString()
//   @IsNotEmpty()
//   password: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @IsBoolean()
  @IsNotEmpty()
  isSocialAuth: boolean;
}
