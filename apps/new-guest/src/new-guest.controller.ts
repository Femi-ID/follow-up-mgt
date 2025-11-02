import { Controller, Get } from '@nestjs/common';
import { NewGuestService } from './new-guest.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NewGuestPatterns } from '@app/contracts/new-guest/constants/message-patterns';
import { NewGuestDto } from '@app/contracts/new-guest/new-guest.dto';
import { DeleteManyGuestsDto } from '@app/contracts/new-guest/delete-guest.dto';
import { UpdateGuestDto } from '@app/contracts/new-guest/update-guest.dto';

@Controller()
export class NewGuestController {
  constructor(private readonly newGuestService: NewGuestService) {}

  @MessagePattern(NewGuestPatterns.CREATE_SINGLE_GUEST)
  async createSingleGuest(@Payload() newGuestDto: NewGuestDto) {
    return this.newGuestService.createSingleGuest(newGuestDto);
  }

  @MessagePattern(NewGuestPatterns.GET_ALL_GUESTS)
  async getAllGuests(@Payload() payload: {filter: any, limit: number, skip: number}) {
    return this.newGuestService.getAllGuests(payload.filter, payload.limit, payload.skip);
  }

  @MessagePattern(NewGuestPatterns.UPDATE_GUEST)
  async updateGuest(@Payload() payload: {id: string, updateGuestDto: UpdateGuestDto}) {
    return this.newGuestService.updateGuest(payload.id, payload.updateGuestDto);
  }

  @MessagePattern(NewGuestPatterns.DELETE_GUEST)
  async deleteGuest(@Payload() id: string) {
    return this.newGuestService.deleteGuest(id);
  }

  @MessagePattern(NewGuestPatterns.DELETE_MANY_GUESTS)
  async deleteManyGuests(@Payload() deleteManyGuestsDto: string[]) {
    return this.newGuestService.deleteManyGuests(deleteManyGuestsDto);
  }
}