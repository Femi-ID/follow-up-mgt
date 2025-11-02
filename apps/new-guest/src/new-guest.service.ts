import { DeleteManyGuestsDto } from '@app/contracts/new-guest/delete-guest.dto';
import { NewGuestDto } from '@app/contracts/new-guest/new-guest.dto';
import { UpdateGuestDto } from '@app/contracts/new-guest/update-guest.dto';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { NewGuest } from 'apps/file-uploads/src/schemas/new-guests.schema';
import { Model, Types } from 'mongoose';
// DECIDE: Whether to make fileName and sheetName required in NewGuest schema
@Injectable()
export class NewGuestService {
  private readonly logger = new Logger(NewGuestService.name);
  constructor(
    @InjectModel(NewGuest.name) private newGuestModel: Model<NewGuest>,
  ) {}

  async createSingleGuest(newGuestDto: NewGuestDto) {
    try {
      this.logger.log(
        'CREATE new-guest message received in new-guest microservice',
        { name: newGuestDto.name },
      );
      if (newGuestDto.email) {
        const email_exists = await this.findByEmail(newGuestDto.email);
        if (email_exists)
          throw new BadRequestException('Guest email already exists');
      }
      const newGuest = await this.newGuestModel.create(newGuestDto);
      this.logger.log('new guest user created..', { name: newGuest.name });
      return newGuest.save();
    } catch (err) {
      this.logger.error('Error creating new guest', err);
      throw new RpcException('Error processing file');
    }
  }

  async findByEmail(email: string) {
    return await this.newGuestModel.findOne({ email }).exec();
  }

  async getAllGuests(filter: object, limit: number, skip: number, selectFields?: string) {
    let projection = {}
    if (selectFields) {
      projection = selectFields.split(',').reduce((acc, field) => {
        acc[field.trim()] = 1;
        return acc;
      }, {});
    }

    const guests = await  this.newGuestModel
      .find(filter, projection)
      .limit(limit)
      .skip(skip)
      .exec();
      this.logger.log(`guest length: ${guests.length}`)
      if (!guests) {
        throw new RpcException('No guests found')
      }
      return guests;
  }

  async updateGuest(id: string, updateGuestDto: UpdateGuestDto) {
    const updateGuest = await this.newGuestModel.findByIdAndUpdate(id, updateGuestDto, { new: true });
    if (!updateGuest) {
      throw new RpcException('Guest not found');
    }
    return updateGuest;
  }

  async deleteGuest(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new RpcException({
        message: `Invalid ID format: "${id}". Must be a 24-character hex string.`,
        statusCode: 400,
      });
    }
    const deletedGuest = await this.newGuestModel.findByIdAndDelete(id);
    if (!deletedGuest) {
      throw new RpcException({
        message: `Guest with ID "${id}" not found.`,
        statusCode: 404,
      });
    }
    return deletedGuest;
  }

  async deleteManyGuests(deleteManyGuestsDto: string[]) {
    console.log('Deleting multiple guests', { ids: deleteManyGuestsDto})
    if (!deleteManyGuestsDto || deleteManyGuestsDto.length === 0) {
      throw new RpcException({
        message: 'No guest IDs provided for deletion.',
      statusCode: 400,
    })
    }
    const deletedGuests = await this.newGuestModel.deleteMany({_id: { $in: deleteManyGuestsDto}}).exec();

    if (deletedGuests.deletedCount === 0) {
      throw new RpcException({message: 'No guests were deleted. Please verify the provided IDs'})
    }

     return {
      message: `${deletedGuests.deletedCount} guests deleted successfully.`,
      deletedCount: deletedGuests.deletedCount,
    };

  }
}
