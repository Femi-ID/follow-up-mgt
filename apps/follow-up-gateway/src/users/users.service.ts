import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { UserPatterns } from '@app/contracts/users/constants/message-patterns';

@Injectable()
export class UsersService {
  constructor(@Inject('USER_CLIENT') private usersClient: ClientProxy) {}

  create(createUserDto: CreateUserDto) {
    return firstValueFrom(this.usersClient.send(UserPatterns.SIGNUP, createUserDto))
  }

  findAll() {
    return firstValueFrom(this.usersClient.send(UserPatterns.FIND_ALL, {}));
  }

  findOne(userId: string) {
    return firstValueFrom(this.usersClient.send(UserPatterns.FIND_ONE, userId ));
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
