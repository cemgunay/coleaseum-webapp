const jwt = require("jsonwebtoken");

const authenticate = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            res.status(401).json({ error: "Access denied. No token provided." });
            return null;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded; // Return the decoded user information

    } catch (error) {
        res.status(400).json({ error: "Invalid token." });
        return null;
    }
};

module.exports = authenticate;
