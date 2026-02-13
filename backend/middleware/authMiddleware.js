
import jwt from 'jsonwebtoken';
import { UserRepository } from '../database/repositories/UserRepository.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key';

export const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token is required.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await UserRepository.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        
        if (user.isBanned) {
            return res.status(403).json({ message: 'User is banned.' });
        }

        req.user = user; // Attach user object to the request
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'Token has expired.' });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: 'Invalid token.' });
        }
        return res.status(500).json({ message: 'Internal server error during authentication.' });
    }
};
