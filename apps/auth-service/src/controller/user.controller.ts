import { Response, NextFunction } from 'express';
import prisma from '../../../../packages/libs/prisma';
import { imagekit } from '../../../../packages/libs/imageKit';


// --- PROFILE DETAILS ---

export const getCurrentUser = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user.id;
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, avatar: true, role: true }
        });
        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};



export const updateUserDetails = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, email } = req.body;
        const user = await prisma.users.update({
            where: { id: req.user.id },
            data: { name, email }
        });
        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};



export const updateUserAvatar = async (req: any, res: Response, next: NextFunction): Promise<void>  => {
    try {
        if (!req.file)  res.status(400).json({ message: 'No file uploaded.' });

        const uploadResponse = await imagekit.upload({
            file: req.file.buffer,
            fileName: `avatar_${req.user.id}_${Date.now()}`,
            folder: '/user_avatars',
        });
        
        const user = await prisma.users.update({
            where: { id: req.user.id },
            data: { avatar: { url: uploadResponse.url, file_id: uploadResponse.fileId } }
        });

        res.status(200).json({ success: true, user });
    } catch (error) {
        next(error);
    }
};



// --- ORDER HISTORY ---

export const getUserOrders = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            prisma.orders.findMany({
                where: { userId: req.user.id },
                include: { items: true }, // Include items count or summary
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.orders.count({ where: { userId: req.user.id } })
        ]);
        
        res.status(200).json({
            success: true,
            orders,
            pagination: { total, currentPage: page, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        next(error);
    }
};



export const getOrderDetails = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { orderId } = req.params;
        const order = await prisma.orders.findFirst({
            where: { id: orderId, userId: req.user.id }, // Ensure user owns the order
            include: {
                items: {
                    include: { product: true } // Include full product details
                }
            }
        });

        if (!order)  res.status(404).json({ message: 'Order not found.' });
        
        res.status(200).json({ success: true, order });
    } catch (error) {
        next(error);
    }
};


// --- ADDRESS BOOK ---

export const getUserAddresses = async (req: any, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const addresses = await prisma.addresses.findMany({
            where: { userId: req.user.id }
        });
        res.status(200).json({ success: true, addresses });
    } catch (error) {
        next(error);
    }
};




export const createAddress = async (req: any, res: Response, next: NextFunction) : Promise<void> => {
    try {
        const newAddress = await prisma.addresses.create({
            data: { ...req.body, userId: req.user.id }
        });
        res.status(201).json({ success: true, address: newAddress });
    } catch (error) {
        next(error);
    }
};



export const updateAddress = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { addressId } = req.params;
        const updatedAddress = await prisma.addresses.updateMany({
            where: { id: addressId, userId: req.user.id }, // Ensure user owns the address
            data: req.body
        });
        if(updatedAddress.count === 0)  res.status(404).json({ message: 'Address not found or you do not have permission to edit it.' });
        res.status(200).json({ success: true, message: 'Address updated.' });
    } catch (error) {
        next(error);
    }
};



export const deleteAddress = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { addressId } = req.params;
        const deletedAddress = await prisma.addresses.deleteMany({
            where: { id: addressId, userId: req.user.id } // Ensure user owns the address
        });
        if(deletedAddress.count === 0)  res.status(404).json({ message: 'Address not found or you do not have permission to delete it.' });
        res.status(200).json({ success: true, message: 'Address deleted.' });
    } catch (error) {
        next(error);
    }
};