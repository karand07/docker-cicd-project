import jwt from "jsonwebtoken";

const COMPANY_SECRET = process.env.COMPANY_SECRET;

export default function companyAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided or invalid format" });
    }

    const token = authHeader.split(" ")[1];

    const verify = jwt.verify(token, COMPANY_SECRET);

    req.companyId = verify.id;

    next();
  } catch (err) {
    console.error("Company Auth Error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
}
