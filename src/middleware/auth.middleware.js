import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    let token = null;

    // =========================
    // 1. Flutter / Mobile
    // =========================
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // =========================
    // 2. Next.js / Web
    // =========================
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // =========================
    // No Token
    // =========================
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // =========================
    // Verify Token
    // =========================
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;