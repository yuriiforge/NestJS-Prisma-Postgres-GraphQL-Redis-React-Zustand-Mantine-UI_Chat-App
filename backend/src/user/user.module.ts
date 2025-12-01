import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [],
  providers: [UserService, UserResolver, PrismaService, JwtService],
})
export class UserModule {}
