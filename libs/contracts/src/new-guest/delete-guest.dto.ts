import { ArrayNotEmpty, IsArray, IsMongoId, IsString } from 'class-validator';

export class DeleteManyGuestsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({
    each: true,  // to validate each element in the array
    message: 'Each ID in the array must be a valid Mongo ObjectId',
  })
  ids: string[];
}
