import NextAuth from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import authConfig from './auth.config'

const { auth } = NextAuth(authConfig)

export default async function middleware(request: NextRequest) {
  const session = await auth()

  if (request.nextUrl.pathname.startsWith('/api/auth')) {
    if (session) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } else if (!session) {
    return NextResponse.redirect(new URL('/api/auth/signin', request.url))
  }
}
