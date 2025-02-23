import { SignJWT } from 'jose'
import type { NextAuthConfig } from 'next-auth'
import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { publishUserCreated } from './lib/events'
import { User } from './lib/types'

export default {
  session: {
    strategy: 'jwt',
  },
  providers: [Google, GitHub],
  callbacks: {
    async jwt({ token, user: authUser, trigger }) {
      const user: User = {
        id: authUser.id!,
        name: authUser.name!,
        email: authUser.email!,
        image: authUser.image ?? null,
      }

      if (trigger === 'signUp') {
        await publishUserCreated(user)
      }

      token.id = user.id

      let signer = new SignJWT({
        name: user.name,
        image: user.image,
      }).setProtectedHeader({ alg: 'HS256' })
      if (token.sub) {
        signer = signer.setSubject(token.sub)
      }
      if (token.exp) {
        signer = signer.setExpirationTime(token.exp!)
      }
      if (token.iat) {
        signer = signer.setIssuedAt(token.iat!)
      }
      if (token.jti) {
        signer = signer.setJti(token.jti)
      }

      const secret = new TextEncoder().encode(process.env.AUTH_SECRET)
      token.api_token = await signer.sign(secret)

      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      ;(session as any).access_token = token.api_token

      return session
    },
  },
} satisfies NextAuthConfig
