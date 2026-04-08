import jwt from "jsonwebtoken";

const ADMIN_SECRET = process.env.ADMIN_SECRET;

export default function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided or invalid format" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, ADMIN_SECRET);

    req.adminId = decoded.id;
    next();
  } catch (err) {
    console.error("Admin Auth Error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
