import bcrypt from "bcryptjs";
import crypto from "crypto";

import jwt from "jsonwebtoken";
import userModel from "../model/user.model.js";
import AppError from "../utils/AppError.js";
import sendEmail from './../utils/sendEmail.js';



const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return next(new AppError("الايميل وكلمة المرور مطلوبة", 400));
    }

    // Find user
    const user = await userModel.findOne({ email });

    if (!user) {
      return next(
        new AppError("الايميل أو كلمة المرور غير صحيحة", 401)
      );
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return next(
        new AppError("الايميل أو كلمة المرور غير صحيحة", 401)
      );
    }

    // Check account status
    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "الحساب غير مفعل، يرجى التواصل مع إدارة المنصة",
      });
    }

    // Create JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        facilityId: user.facilityId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    // =========================
    // Web Authentication
    // =========================
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // =========================
    // Response
    // =========================
    return res.status(200).json({
      success: true,
      message: "تم تسجيل الدخول بنجاح",

      // Flutter will use this token
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        facilityId: user.facilityId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return next(
      new AppError("حدث خطأ أثناء تسجيل الدخول", 500)
    );
  }
};
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    /*
      بنرجع نفس الرسالة سواء المستخدم موجود أو لا
      عشان ما نكشفش إذا كان الإيميل مسجل في النظام.
    */
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "إذا كان البريد الإلكتروني مسجلًا لدينا، سيتم إرسال رابط إعادة تعيين كلمة المرور إليه",
      });
    }

    // Generate random reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before storing it in database
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Token expires after 15 minutes
    const resetExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = resetExpires;

    await user.save();

const resetUrl = `${process.env.FRONTEND_URL}/ResetPassword/${resetToken}`;
    const emailMessage = `
      <div style="font-family: Arial, sans-serif; direction: rtl;">
        <h2>إعادة تعيين كلمة المرور</h2>

        <p>
          تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك.
        </p>

        <p>
          اضغط على الزر التالي لإعادة تعيين كلمة المرور:
        </p>

        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            padding: 12px 20px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 6px;
          "
        >
          إعادة تعيين كلمة المرور
        </a>

        <p>
          هذا الرابط صالح لمدة 15 دقيقة فقط.
        </p>

        <p>
          إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة.
        </p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: "إعادة تعيين كلمة المرور - Seerer",
      html: emailMessage,
    });

    return res.status(200).json({
      success: true,
      message:
        "إذا كان البريد الإلكتروني مسجلًا لدينا، سيتم إرسال رابط إعادة تعيين كلمة المرور إليه",
    });
  }  catch (error) {
  console.error("FORGOT PASSWORD ERROR:", error);
  next(error);
}
};
const resetPassword = async (req, res, next) => {
  try {
    const {
      token,
      newPassword,
    } = req.body;

    // Hash the token received from the frontend
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid reset token
    const user = await userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        $gt: new Date(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hashedPassword;

    // Invalidate reset token
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "تم تغيير كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول",
    });
  } catch (error) {
    next(error);
  }
};
const logout = async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite:
        process.env.NODE_ENV === "production"
          ? "none"
          : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "تم تسجيل الخروج بنجاح",
    });
  } catch (error) {
    next(error);
  }
};
export { login, forgotPassword, resetPassword,logout };