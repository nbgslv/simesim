import type { NextApiRequest, NextApiResponse } from 'next'
import type {User} from "../user";
import UserService from "../../../utils/api/user/UserService";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Partial<User>>
) {
    const { query: { id }, method } = req
    if (method === 'GET') {
        // Return Order by ID
    } else if (method === 'PUT') {
        // Update Draft Order
    } else if (method === 'DELETE') {
        // Delete Draft Order
    }
}
