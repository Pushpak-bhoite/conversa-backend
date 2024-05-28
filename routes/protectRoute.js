import jwt from 'jsonwebtoken';
import user from '../models/user.model.js';

const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        if (!token) {
            return errors.status(401).json({ error: 'No Token Provided ' });
        }
        const decoded = jwt.verify(token, 'secrete');
        if (!decoded) {
            return errors.status(401).json({ error: 'Invalid token provided(tocken mismatches)' });
        }
        const is_user = await user.findById(decoded.userId);
        if (!is_user) {
            return res.status(401).json({ error: 'user not found  ' });
        }
        req.user = is_user;
        next();
    } catch (error) {
        console.log('Error in protectRoute :', error.message)
        res.status(500).json({ error: 'Error in protectRoute' })
    }
}

export default protectRoute;