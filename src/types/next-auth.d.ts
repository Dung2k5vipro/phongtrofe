/**
 * @deprecated Tu March 2026, auth flow chinh da chuyen sang token client-side
 * thong qua service layer (khong dung NextAuth trong UI chinh).
 * File nay duoc giu tam de tranh vo type neu van con module phu thuoc.
 */

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      phone: string;
      avatar?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    phone: string;
    avatar?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    phone: string;
    avatar?: string;
  }
}
