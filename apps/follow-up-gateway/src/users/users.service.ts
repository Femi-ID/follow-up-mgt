import { Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(@Inject('USER_CLIENT') private usersClient: ClientProxy) {}

  create(createUserDto: CreateUserDto) {
    return firstValueFrom(this.usersClient.send('users.signup', createUserDto))
  }

  findAll() {
    return firstValueFrom(this.usersClient.send('users.findAll', {}));
  }

  findOne(userId: string) {
    return firstValueFrom(this.usersClient.send('users.findOne', userId ));
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
