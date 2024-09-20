const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;
    console.log(req.cookies, "<<< from the middleware");
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        console.log(req.user, "<<< from the middleware");
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token is not valid' });
    }
}

module.exports = authMiddleware;
