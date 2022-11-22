import type { NextApiRequest } from 'next';

export default async function handler(req: NextApiRequest) {
  const { method } = req;
  if (method === 'GET') {
    // Return User by ID
  } else if (method === 'PUT') {
    // Update User by ID
  } else if (method === 'DELETE') {
    // Delete User - manager only
  }
}
