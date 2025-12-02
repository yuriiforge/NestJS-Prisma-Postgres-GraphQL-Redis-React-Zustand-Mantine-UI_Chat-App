import { CodegenConfig } from '@graphql-codegen/cli';
import dotenv from 'dotenv';
dotenv.config();

const config: CodegenConfig = {
  schema: process.env.GRAPHQL_API_URL,

  generates: {
    './src/gql/': {
      preset: 'client',
      plugins: ['typescript'],
    },
  },
};

export default config;
