import jwt from 'jsonwebtoken';

const FARMER_SECRET = process.env.FARMER_SECRET||"BiolOOpFarmer";

export default function farmerAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided or invalid format" });
    }

    const token = authHeader.split(" ")[1]; 

    const verify = jwt.verify(token, FARMER_SECRET);

    req.farmerId = verify.id;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
