import { DynamoDBAdapter } from '@auth/dynamodb-adapter'
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import NextAuth from 'next-auth'
import { Resource } from 'sst'
import authConfig from './auth.config'

const dynamoDb = new DynamoDB({
  credentials: {
    accessKeyId: process.env.AUTH_DYNAMODB_ID!,
    secretAccessKey: process.env.AUTH_DYNAMODB_SECRET!,
  },
  region: process.env.AUTH_DYNAMODB_REGION,
})

const client = DynamoDBDocument.from(dynamoDb, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DynamoDBAdapter(client, {
    tableName: Resource.DynamoTable.name,
  }),
  ...authConfig,
})
