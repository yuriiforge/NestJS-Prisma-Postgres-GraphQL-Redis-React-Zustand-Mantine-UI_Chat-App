import { Catch, BadRequestException } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { ApolloServerErrorCode } from '@apollo/server/errors';

@Catch(BadRequestException)
export class GraphQLErrorFilter implements GqlExceptionFilter {
  catch(exception: BadRequestException) {
    const response = exception.getResponse();

    // If the response is an object, include it in extensions
    const extensions =
      typeof response === 'object'
        ? { ...response, code: ApolloServerErrorCode.BAD_USER_INPUT }
        : { code: ApolloServerErrorCode.BAD_REQUEST };

    throw new GraphQLError('Validation error', { extensions });
  }
}
