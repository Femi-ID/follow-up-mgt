import { DeleteManyGuestsDto } from '@app/contracts/new-guest/delete-guest.dto';
import { NewGuestDto } from '@app/contracts/new-guest/new-guest.dto';
import { AnalyticsGroupByUnit, QueryAnalyticsDto } from '@app/contracts/new-guest/query-analytics.dto';
import { QueryGuestsDto } from '@app/contracts/new-guest/query-guest.dto';
import { UpdateGuestDto } from '@app/contracts/new-guest/update-guest.dto';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { NewGuest } from 'apps/file-uploads/src/schemas/new-guests.schema';
import { Model, Types } from 'mongoose';
// DECIDE: Whether to make fileName and sheetName required in NewGuest schema

type ResolvedAnalyticsQuery = {
  finalStartDate: Date;
  finalEndDate: Date;
  finalGroupByUnit: AnalyticsGroupByUnit
}

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


  async getAnalyticsSummary(query: QueryAnalyticsDto) {
    // to resolve all date and grouping logic
    const { finalStartDate, finalEndDate, finalGroupByUnit } = this.resolveAnalyticsQuery(query)

    // to build $match stage
    const $match: any = {
      serviceDate: {
        $gte: finalStartDate,
        $lt: finalEndDate
      }
    };
    // Add optional filters from the query
    if (query.gender) $match.gender = query.gender;
    if (query.ageGroup) $match.ageGroup = query.ageGroup;
    if (query.member !== undefined) $match.member = query.member;
    if (query.response) $match.response = query.response;

    let groupFormat: string 
    switch (finalGroupByUnit) {
      case AnalyticsGroupByUnit.DAY:
        groupFormat = '%Y-%m-%d';
        break;
      case AnalyticsGroupByUnit.WEEK:
        groupFormat = '%G-%V'; // ISO week date format- 2025-37
        break;
      case AnalyticsGroupByUnit.MONTH:
        groupFormat = '%Y-%m';
        break;
      default:
        groupFormat = '%Y-%m'
        break
    }

    const $group: any = {
      _id: {
        $dateToString: {
          format: groupFormat,
          date: '$serviceDate',
          timezone: 'UTC', // To ensure consistent grouping regardless of server TZ
        },
      },
      count: { $sum: 1} // Count 1 for each document in the group
    }

    // To clean up the output for the frontend
    const $project = {
      _id: 0, // To remove the _id
      group: '$_id', // Rename _id to a clean "group" key
      count: 1
    }
    const $sort = {
      group: 1 // To sort ascending "2025-01", "2025-02"
    }
    const pipeline: any[] = [
      { $match },
      { $group },
      { $project},
      { $sort }
    ]

    this.logger.log(
      `Running analytics pipeline: unit=${finalGroupByUnit}, ` + 
      `start=${finalStartDate.toISOString()}, end=${finalEndDate.toISOString()}`
    );

    try {
      const results = await this.newGuestModel.aggregate(pipeline);
      return results;
    } catch (error) {
      this.logger.error('Analytics aggregation failed', error.stack)
      throw new RpcException('Failed to generate analytics data.')
    }
  }


  private resolveAnalyticsQuery(query: QueryAnalyticsDto): ResolvedAnalyticsQuery {
    const today = new Date();

    // priority 1- specific date range
    if (query.startDate || query.endDate) {
      const finalStartDate = query.startDate ? new Date(query.startDate) : new Date(0)
      const finalEndDate = query.endDate ? new Date(query.endDate) : today 
      const finalGroupByUnit = query.groupByUnit || AnalyticsGroupByUnit.DAY

      return this.finalizeQuery(finalStartDate, finalEndDate, finalGroupByUnit)
    }

    // month range
    if (query.startMonth || query.endMonth) {
      // default to start of the year if no startMonth
      const startStr = query.startMonth || `${today.getUTCFullYear()}-01`; // default to 2025-01
      const [ startYear, startMonth] = startStr.split('-').map(Number)
      const finalStartDate = new Date(Date.UTC(startYear, startMonth -1, 1))

      // default to current month if no endMonth
      const endStr = query.endMonth || `${today.getUTCFullYear()}-${today.getUTCMonth() + 1}`
      const [ endYear, endMonth] = endStr.split('-').map(Number)
      // To get the last day: go to the 1st of the next month, then subtract 1 millisecond.
      // Date.UTC(year, month) is 1st of next month (since month is 0-indexed)
      const finalEndDate = new Date(Date.UTC(endYear, endMonth, 0)); // 0th day = last day of *previous* month
      const finalGroupByUnit = query.groupByUnit || AnalyticsGroupByUnit.MONTH;

      return this.finalizeQuery(finalStartDate, finalEndDate, finalGroupByUnit)
    }

    // default Year-to-Date: If no startDate/endDate/month-range given, then use beginning of year till current date
    const finalStartDate = new Date(Date.UTC(today.getUTCFullYear(), 0, 1)) // Jan 1
    const finalEndDate = today;
    const finalGroupByUnit = query.groupByUnit || AnalyticsGroupByUnit.MONTH
    this.logger.log(' No date range provided, defaults were used.')
    return this.finalizeQuery(finalStartDate, finalEndDate, finalGroupByUnit)
  }


  private finalizeQuery(start: Date, end: Date, unit: AnalyticsGroupByUnit): ResolvedAnalyticsQuery {
    start.setUTCHours(0,0,0,0)
    end.setUTCHours(23, 59, 59, 999) // To get the last day: go to the 1st of the *next* month, then subtract 1 millisecond.
    return {
      finalStartDate: start,
      finalEndDate: end,
      finalGroupByUnit: unit
    }
  }
}
