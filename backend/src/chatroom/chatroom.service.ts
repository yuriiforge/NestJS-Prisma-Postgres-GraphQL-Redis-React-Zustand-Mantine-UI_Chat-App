import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { createWriteStream } from 'fs';
import { FileUpload } from 'graphql-upload-ts';
import { Readable } from 'stream';

@Injectable()
export class ChatroomService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getChatroom(id: string) {
    return this.prisma.chatroom.findUnique({
      where: {
        id: parseInt(id),
      },
    });
  }

  async createChatroom(name: string, sub: number) {
    const existingChatroom = await this.prisma.chatroom.findFirst({
      where: {
        name,
      },
    });

    if (existingChatroom) {
      throw new BadRequestException('Chatroom already exists');
    }

    return this.prisma.chatroom.create({
      data: {
        name,
        users: {
          connect: {
            id: sub,
          },
        },
      },
    });
  }

  async addUsersToChatroom(chatroomId: number, userIds: number[]) {
    const existingChatroom = await this.prisma.chatroom.findUnique({
      where: { id: chatroomId },
    });

    if (!existingChatroom) {
      throw new BadRequestException('Chatroom does not exists');
    }

    return await this.prisma.chatroom.update({
      where: { id: chatroomId },
      data: {
        users: {
          connect: userIds.map((uid) => ({ id: uid })),
        },
      },
      include: {
        users: true,
      },
    });
  }

  async getChatroomsForUser(userId: number) {
    return this.prisma.chatroom.findMany({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async sendMessage(
    chatroomId: number,
    message: string,
    userId: number,
    imagePath: string,
  ) {
    return await this.prisma.message.create({
      data: {
        content: message,
        imageUrl: imagePath,
        chatroomId,
        userId,
      },
      include: {
        chatroom: {
          include: {
            users: true,
          },
        },
        user: true,
      },
    });
  }

  async saveImage(image: FileUpload) {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(image.mimetype)) {
      throw new BadRequestException('Invalid image type');
    }

    const imageName = `${Date.now()}-${image.filename}`;
    const imagePath = `${this.configService.get<string>('IMAGE_PATH')}/${imageName}`;
    const stream: Readable = image.createReadStream();
    const outputPath = `public${imagePath}`;
    const writeStream = createWriteStream(outputPath);

    stream.pipe(writeStream);

    await new Promise((res, rej) => {
      stream.on('end', res);
      stream.on('error', rej);
    });

    return imagePath;
  }

  async getMessagesForChatroom(chatroomId: number) {
    return await this.prisma.message.findMany({
      where: {
        chatroomId,
      },
      include: {
        chatroom: {
          include: {
            users: {
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
        user: true,
      },
    });
  }

  async deleteChatroom(chatroomId: number) {
    return this.prisma.chatroom.delete({
      where: { id: chatroomId },
    });
  }
}
