import { Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [],
  providers: [AuthResolver, AuthService, JwtService, PrismaService],
})
export class AuthModule {}
