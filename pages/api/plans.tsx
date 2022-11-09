import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from "../../lib/prisma";
import {Prisma, Country} from "@prisma/client";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Prisma.CountrySelect | unknown>
) {
    try {
        const { method } = req
        if (method === 'POST') {
            const newPlan = await prisma.plan.create({
                data: {
                    price: undefined,
                }
            });
            res.status(200).json(newPlan);
        } else if (method === 'GET') {
            // Return Order by ID
        } else if (method === 'PUT') {
            // Update Order
        } else if (method === 'DELETE') {
            const { ids } = req.body;
            const deleteCount = await prisma.plan.deleteMany({
                where: {
                    id: {
                        in: ids
                    }
                }
            })
            res.status(200).json(deleteCount);
        } else {
            res.status(405).json({ message: 'Method not allowed' })
        }
    } catch (error: unknown) {
        console.error(error)
        res.status(500).json(error)
    }
}
