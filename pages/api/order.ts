import type { NextApiRequest, NextApiResponse } from 'next'

export enum OrderStatus {
    READY = 'READY',
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    FINISHED = 'FINISHED',
    DRAFT = 'DRAFT',
}

export type Order = {
    id: string,
    externalId: string,
    simId: string,
    bundleId: string,
    status: OrderStatus,
    activatedAt: Date,
    createdAt: Date,
    updatedAt: Date,
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Partial<Order>>
) {
    // Create Order - Return new order ID
    // Get Orders - bulk - manager only
    // Update Orders - bulk - manager only
    // Delete Order - bulk - manager only
}
