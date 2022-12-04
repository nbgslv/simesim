import 'next-auth';

declare module 'next-auth' {
  export interface JWT {
    id: string;
    name: string;
    role: string;
    emailEmail: string;
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
    emailEmail: string;
  }

  export interface Session {
    user: User;
  }
}
