import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorators';
import { Role } from 'apps/users/src/enums/roles.enums';
import { RolesGuard } from '../guards/roles/roles.guard';
import { Public } from '../auth/decorators/public.decorators';
// import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Roles(Role.ADMIN, Role.TEAM_LEADER, Role.TEAM_MEMBER)
  @Get('all')
  findAll() {
    return this.usersService.findAll();
  }

  // @UseGuards(JwtAuthGuard)
  // @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEAM_LEADER, Role.TEAM_MEMBER)
  @Get('profile')
  findOne(@Req() req) {
    console.log('req userId', req.user);
    return this.usersService.findOne(req.user.id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.usersService.update(+id, updateUserDto);
  // }

  // @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.TEAM_LEADER)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
