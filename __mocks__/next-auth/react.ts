const mockSession = {
  expires: new Date(Date.now() + 2 * 86400).toISOString(),
  user: {
    email: '0512345678',
    emailEmail: 'test@test.com',
    id: 'clcclcclcclcclcclc1234',
    image: null,
    name: 'foo bar',
    role: 'ADMIN',
  },
};

export const useSession = jest.fn(
  () => ({ data: mockSession, status: 'authenticated' }) // return type is [] in v3 but changed to {} in v4
);
export const signOut = jest.fn(() =>
  Promise.resolve({ url: process.env.NEXTAUTH_URL as string })
);
