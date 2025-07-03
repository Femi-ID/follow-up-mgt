import { CreateUserDto } from '@app/contracts/auth/dto/create-user.dto';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/users.schemas';
import { Model } from 'mongoose';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async signUp(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;
    const existingUser = await this.findByEmail(email);
    if (existingUser) throw new BadRequestException('User already exists');

    const hashedPassword = await this.hashPassword(password);
    
    createUserDto.password, createUserDto.email = hashedPassword, email;
    const newUser = this.userModel.create({ createUserDto})
    return newUser;
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email }).exec();
  }

  async hashPassword(password: string) {
    try {
      return await argon2.hash(password);
    } catch (err) {
      console.error(err);
      throw new UnauthorizedException('Failed to hash password');
    }
  }

  async findAll() {
    const users = await this.userModel.find().exec();
    if (!users || users.length === 0) throw new BadRequestException('No users found');
    return users; 
  }

  async findOne(userId: string) {
    const user = await this.userModel.findById(userId)
    if (!user) throw new BadRequestException('No user found');
    return user
  }

  async updateHashedRefreshToken(userId: string, hashedRefreshToken: string) {
    const user = await this.userModel.findByIdAndUpdate(userId, { hashedRefreshToken: hashedRefreshToken})
    if (!user) throw new BadRequestException('Unable to update refresh token, no USER found!');
    return user;
  }
}
