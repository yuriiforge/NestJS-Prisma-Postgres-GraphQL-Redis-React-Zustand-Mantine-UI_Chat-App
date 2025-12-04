import { Module } from '@nestjs/common';
import { LiveChatroomResolver } from './live-chatroom.resolver';
import { LiveChatroomService } from './live-chatroom.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [UserModule, JwtModule],
  providers: [LiveChatroomResolver, LiveChatroomService],
})
export class LiveChatroomModule {}
