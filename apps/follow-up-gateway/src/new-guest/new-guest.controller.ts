import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { NewGuestService } from './new-guest.service';
import { Roles } from '../auth/decorators/roles.decorators';
import { Role } from 'apps/users/src/enums/roles.enums';
import { NewGuestDto } from '@app/contracts/new-guest/new-guest.dto';
import { Public } from '../auth/decorators/public.decorators';
import { QueryGuestsDto } from '@app/contracts/new-guest/query-guest.dto';
import { DeleteManyGuestsDto } from '@app/contracts/new-guest/delete-guest.dto';
import { UpdateGuestDto } from '@app/contracts/new-guest/update-guest.dto';

@Controller('new-guest')
export class NewGuestController {
  constructor(private readonly newGuestService: NewGuestService) {}

  @Roles(Role.ADMIN, Role.TEAM_LEADER, Role.TEAM_MEMBER)
  @Post('create/single')
  createSingleGuest(@Body() newGuestDto: NewGuestDto) {
    return this.newGuestService.createSingleGuest(newGuestDto);
  }

  // @Roles(Role.ADMIN, Role.TEAM_LEADER, Role.TEAM_MEMBER)
  @Public()
  @Get('all')
  getAllGuests(@Query() query: QueryGuestsDto) {
    return this.newGuestService.getAllGuests(query);
  }

  @Roles(Role.ADMIN, Role.TEAM_LEADER, Role.TEAM_MEMBER)
  @Patch(':id')
  updateGuest(@Param('id') id: string, @Body() updateGuestDto: UpdateGuestDto) {
    return this.newGuestService.updateGuest(id, updateGuestDto);
  }

  //   @Roles(Role.ADMIN, Role.TEAM_LEADER, Role.TEAM_MEMBER)
  @Public()
  @Delete('batch')
  deleteManyGuests(@Body() deleteManyGuestsDto: DeleteManyGuestsDto) {
    console.log('Deleting multiple guests', { ids: deleteManyGuestsDto})
    return this.newGuestService.deleteManyGuests(deleteManyGuestsDto.ids);
  }

  // @Roles(Role.ADMIN, Role.TEAM_LEADER, Role.TEAM_MEMBER)
  @Public()
  @Delete(':id')
  deleteGuest(@Param('id') id: string) {
    return this.newGuestService.deleteGuest(id);
  }
}
