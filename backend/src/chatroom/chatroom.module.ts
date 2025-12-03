import { Module } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { ChatroomResolver } from './chatroom.resolver';
import { PrismaService } from '../prisma.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [ConfigModule, UserModule, JwtModule],
  providers: [ChatroomService, ChatroomResolver, PrismaService],
})
export class ChatroomModule {}
