declare module 'apollo-upload-client/dist/cjs/index.js' {
  import { ApolloLink } from '@apollo/client';

  export function createUploadLink(options?: {
    uri?: string;
    headers?: Record<string, string>;
    credentials?: 'include' | 'same-origin' | 'omit';
  }): ApolloLink;
}
