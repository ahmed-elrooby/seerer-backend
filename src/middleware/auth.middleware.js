import jwt from "jsonwebtoken";
import userModel from "../model/user.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    let token = null;

    // Flutter / Mobile: Bearer token
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // Web: HttpOnly cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "يرجى تسجيل الدخول أولًا",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Verify that the user still exists and is active
    const user = await userModel.findById(decoded.userId)
      .select("_id name email role facilityId isActive");

    if (!user || user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: "الحساب غير موجود أو غير مفعل",
      });
    }

    // Use current role and facility from the database
    req.user = {
      userId: user._id.toString(),
      role: user.role,
      facilityId: user.facilityId,
    };

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "جلسة الدخول غير صالحة أو انتهت صلاحيتها",
      });
    }

    next(error);
  }
};

export default authMiddleware;