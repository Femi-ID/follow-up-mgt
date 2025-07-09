import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CreateUserDto } from '@app/contracts/auth/dto/create-user.dto';
import { UserPatterns } from '@app/contracts/users/constants/message-patterns';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(UserPatterns.USER_SIGNUP)
  async signUp(@Payload() credential: CreateUserDto) {
    return this.usersService.signUp(credential);
  }
  
  @MessagePattern(UserPatterns.USERS_FIND_ALL)
  async findAll() {
    return this.usersService.findAll();
  }

  @MessagePattern(UserPatterns.USERS_FIND_ONE)
  async findOne(@Payload() userId: string) {
    return await this.usersService.findOne(userId);
  }
}
