import 'next-auth';

declare module 'next-auth' {
  export interface JWT {
    id: string;
    name: string;
    role: string;
  }

  interface User {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string;
  }

  export interface Session {
    user: User;
  }
}
