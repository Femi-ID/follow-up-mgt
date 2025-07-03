import { Role } from 'apps/users/src/enums/roles.enums';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CurrentRequestUserDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
