export const authConfig = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/connexion' },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = auth?.user?.role
      const isPharmacieArea = nextUrl.pathname.startsWith('/pharmacie')
      const isAdminArea = nextUrl.pathname.startsWith('/admin')

      if (isPharmacieArea) return isLoggedIn
      if (isAdminArea) {
        if (!isLoggedIn) return false
        if (role !== 'ADMIN') return Response.redirect(new URL('/pharmacie/stock', nextUrl))
        return true
      }
      return true
    },
  },
}
