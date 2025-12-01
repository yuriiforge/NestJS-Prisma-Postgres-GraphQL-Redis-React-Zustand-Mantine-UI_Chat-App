import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id: number;

  @Field()
  fullname: string;

  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  avatarUrl?: string | null;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
