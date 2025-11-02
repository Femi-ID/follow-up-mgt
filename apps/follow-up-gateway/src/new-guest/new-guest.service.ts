import { NewGuestPatterns } from '@app/contracts/new-guest/constants/message-patterns';
import { DeleteManyGuestsDto } from '@app/contracts/new-guest/delete-guest.dto';
import { NewGuestDto } from '@app/contracts/new-guest/new-guest.dto';
import { QueryGuestsDto } from '@app/contracts/new-guest/query-guest.dto';
import { UpdateGuestDto } from '@app/contracts/new-guest/update-guest.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class NewGuestService {
  private readonly logger = new Logger(NewGuestService.name);
  constructor(
    @Inject('NEW_GUEST_CLIENT') private newGuestClient: ClientProxy,
  ) {}

  createSingleGuest(newGuestDto: NewGuestDto) {
    this.logger.log(
      'CREATE new-guest request sent to new-guest microservice',
      newGuestDto.name,
    );
    return firstValueFrom(
      this.newGuestClient.send(
        NewGuestPatterns.CREATE_SINGLE_GUEST,
        newGuestDto,
      ),
    );
  }

  async getAllGuests(query: QueryGuestsDto) {
    const filter: any = {};

    // 'i'- case-insensitive partial match
    if (query.name) {
      filter.name = { $regex: query.name, $options: 'i' };
    }
    if (query.email) {
      filter.email = { $regex: query.email, $options: 'i' };
    }
    if (query.phoneNumber) {
      filter.phoneNumber = { $regex: query.phoneNumber, $options: 'i' };
    }
    if (query.member !== undefined) {
      filter.member = query.member;
    }
    if (query.gender) {
      filter.gender = query.gender;
    }
    if (query.ageGroup) {
      filter.ageGroup = query.ageGroup;
    }
    if (query.response) {
      filter.response = query.response;
    }

    const dateFilter: any = {};
    if (query.serviceDate) {
      // Single day filter- highest priority
      const startDate = new Date(query.serviceDate);
      startDate.setUTCHours(0, 0, 0, 0)

      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1); // start of the next day

      dateFilter.$gte = startDate.toISOString()
      dateFilter.$lt = endDate.toISOString()
    } else if (query.startDate || query.endDate) {
      // Day range filter
      if (query.startDate) {
        const startDate = new Date(query.startDate);
        startDate.setUTCHours(0, 0, 0, 0);
        dateFilter.$gte = startDate.toISOString()
      }
      if (query.endDate) {
        const endDate = new Date(query.endDate);
        endDate.setUTCHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() + 1) // move to the next day
        dateFilter.$lt = endDate.toISOString()
      }
    } else if (query.month) { 
      // format- "2025-10", months are indexed as 0=Jan, 9=Oct
      const [ year, month ] = query.month.split('-').map(Number);
      const startDate = new Date(Date.UTC(year, month -1, 1, 0, 0, 0))
      const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0)) // the start of the next month
      dateFilter.$gte = startDate;
      dateFilter.$lt = endDate;
    } else if (query.startMonth || query.endMonth) {
      // month range format- "2025-01 to 2025-07" Jan-Jun
      if (query.startMonth) {
        const [year, month] = query.startMonth.split('-').map(Number)
        const startDate = new Date(Date.UTC(year, month -1, 1, 0, 0, 0))
        dateFilter.$gte = startDate;
      }
      if (query.endMonth) {
        const [year, month] = query.startMonth.split('-').map(Number)
        const startDate = new Date(Date.UTC(year, month, 1, 0, 0, 0))
        dateFilter.$gte = startDate;
    }
  } else if (query.year) {
    const year = query.year
    const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0)) // Jan 1st
    const endDate = new Date(Date.UTC(year +1, 0, 1, 0, 0, 0)) // Jan 1st of next year

    dateFilter.$gte = startDate;
    dateFilter.$lt = endDate;
  } else if (query.startYear || query.endYear) {
    if (query.startYear) {
      const startDate = new Date(Date.UTC(query.startYear, 0, 1, 0, 0, 0))
      dateFilter.$gte = startDate
    }
    if (query.endYear) {
      const endDate = new Date(Date.UTC(query.endYear +1, 0, 1, 0, 0, 0 ))
      dateFilter.$lt = endDate
    }
  }

  if (Object.keys(dateFilter).length > 0) {
    filter.serviceDate = dateFilter;
  }



    // **********************************************************
    // if (query.serviceDate) {
    //   const startDate = new Date(query.serviceDate);
    //   startDate.setUTCHours(0, 0, 0, 0)

    //   const endDate = new Date(startDate);
    //   endDate.setDate(startDate.getDate() + 1);

    //   filter.serviceDate = { 
    //     $gte: startDate.toISOString(), 
    //     $lt: endDate.toISOString()
    //   };
    // } else if (query.startDate || query.endDate) {
    //   // To handle query for a date range
    //   filter.serviceDate = {}
    //   if (query.startDate) {
    //     const startDate = new Date(query.startDate);
    //     startDate.setUTCHours(0, 0, 0, 0);
    //     filter.serviceDate.$gte = startDate.toISOString();
    //   }
    //   if (query.endDate) {
    //     const endDate = new Date(query.endDate);
    //     endDate.setUTCHours(0, 0, 0, 0);
    //     endDate.setDate(endDate.getDate() + 1)
    //     filter.serviceDate.$lt = endDate.toISOString();
    //   }
    // }

    const limit = 10;
    const currentPage: number = query.page || 1;
    const skip: number = (currentPage - 1) * limit;

    this.logger.log('GET all-guests request sent to new-guest microservice', {
      filter: filter,
      page: currentPage,
      limit: limit,
      skip: skip
    });

    return firstValueFrom(
      this.newGuestClient.send(NewGuestPatterns.GET_ALL_GUESTS, {
        filter,
        limit,
        skip,
      }),
    );
  }

  async updateGuest(id: string, updateGuestDto: UpdateGuestDto) {
    return firstValueFrom(this.newGuestClient.send(NewGuestPatterns.UPDATE_GUEST, {id, updateGuestDto}));
  }

  async deleteGuest(id: string) {
    return firstValueFrom(this.newGuestClient.send(NewGuestPatterns.DELETE_GUEST, id));
  }

  async deleteManyGuests(deleteManyGuestsDto: string[]) {
    this.logger.log(
      'DELETE new-guest request sent to new-guest microservice'
    );
    return firstValueFrom(this.newGuestClient.send(NewGuestPatterns.DELETE_MANY_GUESTS, deleteManyGuestsDto))
  }
}
