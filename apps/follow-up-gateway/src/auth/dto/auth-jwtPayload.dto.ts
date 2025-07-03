import { IsNotEmpty, IsString } from 'class-validator';

export class JwtPayload {
  @IsString()
  @IsNotEmpty()
  sub: string;

  // @IsString()
  // @IsNotEmpty()
  // firstName: string;
}
