import { db } from '@/lib/db'
import { DynamoDBAdapter } from '@auth/dynamodb-adapter'
import NextAuth from 'next-auth'
import { Resource } from 'sst'
import authConfig from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DynamoDBAdapter(db, {
    tableName: Resource.DynamoTable.name,
  }),
  ...authConfig,
})
