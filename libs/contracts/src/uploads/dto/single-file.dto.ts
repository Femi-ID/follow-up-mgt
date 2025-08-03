import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class SingleFilePayload {
  @IsString()
  @IsNotEmpty()
  filePath: string; // Full path in diskStorage or cloud service URL

  @IsString()
  @IsNotEmpty()
  fieldname: string;

  @IsString() 
  @IsNotEmpty()
  originalname: string; 

  @IsString()
  @IsNotEmpty()
  mimetype: string;

  @IsOptional()
  buffer?: Buffer;

  // @IsString()
  // @IsNotEmpty()
  // uploadedBy: string; // user ID or email
}