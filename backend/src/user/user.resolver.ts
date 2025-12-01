import { Resolver, Context, Mutation, Args } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './user.type';
import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { GraphqlAuthGuard } from '../auth/graphql-auth.guard';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload, GraphQLUpload } from 'graphql-upload-ts';
import { Request } from 'express';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(GraphqlAuthGuard)
  @Mutation(() => User)
  async updateProfile(
    @Args('fullname') fullname: string,
    @Args('file', { type: () => GraphQLUpload, nullable: true })
    file: FileUpload,
    @Context() context: { req: Request },
  ) {
    const imageUrl = file ? await this.storeImageAndGetUrl(file) : null;
    const userId = context?.req?.user?.sub;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    return this.userService.updateProfile(userId, fullname, imageUrl);
  }

  private async storeImageAndGetUrl(file: FileUpload) {
    const { filename } = file;

    const uniqueFilename = `${uuidv4()}_${filename}`;

    const imagePath = join(process.cwd(), 'public', uniqueFilename);
    const imageUrl = `${process.env.APP_URL}/${uniqueFilename}`;

    await new Promise<void>((resolve, reject) => {
      const stream = file.createReadStream();
      stream
        .pipe(createWriteStream(imagePath))
        .on('finish', () => resolve())
        .on('error', (err) => reject(err));
    });

    return imageUrl;
  }
}
