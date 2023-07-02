import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signUp(email: string, password: string) {
    //check if email is in use
    const users = await this.usersService.find(email); // returns array
    if (users.length) {
      throw new BadRequestException('email in use');
    }

    // generate salt
    const salt = randomBytes(8).toString('hex');
    // hash the user pasword
    const hash = (await scrypt(password, salt, 32)) as Buffer; // scrypt returns buffer so we are helping typescript to understand the type

    // join them
    const result = salt + '.' + hash.toString('hex');
    // create a new user and save it
    const user = await this.usersService.create(email, result);
    return user;
  }

  async singIn(email: string, password: string) {
    //check if email is in use
    const [user] = await this.usersService.find(email); // returns array
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (hash.toString('hex') !== storedHash) {
      throw new UnauthorizedException('Password is not matching!');
    }
    // user can be logged in now
    return user;
  }
}
