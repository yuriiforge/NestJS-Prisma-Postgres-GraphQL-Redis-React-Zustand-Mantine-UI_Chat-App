import { Resolver, Query } from '@nestjs/graphql';

@Resolver()
export class AuthResolver {
  @Query(() => String)
  hello() {
    return 'hello';
  }
}
