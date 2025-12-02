import { createClient } from 'graphql-ws';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { ApolloClient, gql, Observable } from '@apollo/client';
import { type RefreshTokenResponse } from './types/responses';
import { useUserStore } from './stores/userStore';
import { ErrorLink } from '@apollo/client/link/error';
import { ApolloLink } from '@apollo/client';
import { InMemoryCache } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import UploadHttpLink from 'apollo-upload-client/UploadHttpLink.mjs';
import { CombinedGraphQLErrors } from '@apollo/client';

async function refreshToken(client: ApolloClient) {
  try {
    const { data } = await client.mutate<RefreshTokenResponse>({
      mutation: gql`
        mutation RefreshToken {
          refreshToken
        }
      `,
    });
    const newAccessToken = data?.refreshToken;
    if (!newAccessToken) {
      throw new Error('New access token not received.');
    }
    return `Bearer ${newAccessToken}`;
  } catch (err) {
    console.error(err);
    throw new Error('Error getting new access token.');
  }
}

let retryCount = 0;
const maxRetry = 3;

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:3000/graphql',
    connectionParams: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
  })
);

const errorLink = new ErrorLink(({ error, operation, forward }) => {
  if (CombinedGraphQLErrors.is(error)) {
    for (const err of error.errors) {
      const errorCode = err.extensions?.code;

      if (errorCode === 'UNAUTHENTICATED' && retryCount < maxRetry) {
        retryCount++;

        return new Observable<ApolloLink.Result>((observer) => {
          refreshToken(client)
            .then((token) => {
              operation.setContext(
                (previousContext: Record<string, unknown>) => {
                  const rawHeaders = previousContext.headers;

                  const existingHeaders =
                    typeof rawHeaders === 'object' && rawHeaders !== null
                      ? rawHeaders
                      : {};

                  return {
                    headers: {
                      ...existingHeaders,
                      authorization: token,
                    },
                  };
                }
              );

              const forward$ = forward(operation);
              forward$.subscribe(observer);
            })
            .catch((e) => observer.error(e));
        });
      }

      if (err.message === 'Refresh token not found') {
        useUserStore.setState({
          id: undefined,
          fullname: '',
          email: '',
        });
      }
    }
  }
});

const uploadLink = new UploadHttpLink({
  uri: 'http://localhost:3000/graphql',
  credentials: 'include',
  headers: {
    'apollo-require-preflight': 'true',
  },
});

const link = ApolloLink.split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  ApolloLink.from([errorLink, uploadLink])
);

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: ApolloLink.from([link]),
});
