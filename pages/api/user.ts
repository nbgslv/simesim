import type { NextApiRequest, NextApiResponse } from 'next';

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  nationalId: string;
  allowNewsLetter: boolean;
  allowSms: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Partial<User>>
) {
  // Create User - Return new user ID
  // Get Users - bulk - manager only
  // Update Users - bulk - manager only
  // Delete Users - bulk - manager only
}
