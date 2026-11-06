import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import * as bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { authConfig } from '@/auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').trim().toLowerCase()
        const motDePasse = String(credentials?.password ?? '')
        if (!email || !motDePasse) return null

        const utilisateur = await prisma.utilisateur.findUnique({
          where: { email },
        })
        if (!utilisateur) return null

        const valide = await bcrypt.compare(motDePasse, utilisateur.motDePasse)
        if (!valide) return null

        return {
          id: utilisateur.id,
          name: utilisateur.nom,
          email: utilisateur.email,
          role: utilisateur.role,
        }
      },
    }),
  ],
})
