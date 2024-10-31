const jwt = require('jsonwebtoken');


const verify = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer')) {
        console.log("Header error");
        return res.status(401).json({ message: "Authorization header missing or invalid" });
    }
    const token = header.split(' ')[1];
    if (token) {
        jwt.verify(token, process.env.JWT_SEC, (err, user) => {
            if (err || !user) {
                console.log("Invalid");
                return res.status(401).json({ message: "Invalid session" })
            }
            req.user = user,
                next()
        })
    }
    else {
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

module.exports = verify