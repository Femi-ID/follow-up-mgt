import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from '@app/contracts/auth/dto/create-user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern('users.signup')
  async signUp(@Payload() credential: CreateUserDto) {
    return this.usersService.signUp(credential);
  }
  
  @MessagePattern('users.findAll')
  async findAll() {
    return this.usersService.findAll();
  }

  @MessagePattern('users.findOne')
  async findOne(@Payload() userId: string) {
    return await this.usersService.findOne(userId);
  }
}
