import { CodegenConfig } from '@graphql-codegen/cli';
import dotenv from 'dotenv';
dotenv.config();

const config: CodegenConfig = {
  schema: process.env.GRAPHQL_API_URL,
  documents: ['src/graphql/**/*.ts'],
  generates: {
    './src/gql/': {
      preset: 'client',
      plugins: ['typescript'],
      config: {
        avoidOptionals: true,
      },
    },
  },
};

export default config;
