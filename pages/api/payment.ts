import type { NextApiRequest, NextApiResponse } from 'next'

export type Payment = {
    id: string,
    orderId: string,
    createdAt: Date,
    updatedAt: Date,
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<Partial<Payment>>
) {
    // Create payment - user payment for order
    // Get payments - bulk - manager only
    // Update payments - bulk - manager only
}
