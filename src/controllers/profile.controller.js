import userModel from "../model/user.model.js";
import healthcareFacilityModel from "../model/healthcareFacility.model.js";
import AppError from "../utils/AppError.js";

const getProfile = async (req, res, next) => {
  try {
    const user = await userModel
      .findById(req.user.userId)
      .select("-password");

    if (!user) {
      return next(
        new AppError("المستخدم غير موجود", 404)
      );
    }

    let facility = null;

    if (user.role === "hospital_admin") {
      facility = await healthcareFacilityModel.findById(
        user.facilityId
      );

      if (!facility) {
        return next(
          new AppError(
            "المنشأة الطبية المرتبطة بالحساب غير موجودة",
            404
          )
        );
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          facilityId: user.facilityId,
        },
        facility,
      },
    });
  } catch (error) {
    next(error);
  }
};
const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return next(
        new AppError("المستخدم غير موجود", 404)
      );
    }

    // التأكد إن الإيميل الجديد مش مستخدم عند مستخدم آخر
    if (email && email !== user.email) {
      const existingUser = await userModel.findOne({
        email,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return next(
          new AppError(
            "البريد الإلكتروني مستخدم بالفعل",
            400
          )
        );
      }
    }

    if (name !== undefined) {
      user.name = name;
    }

    if (email !== undefined) {
      user.email = email;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "تم تحديث البروفايل بنجاح",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        facilityId: user.facilityId,
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  getProfile,
  updateProfile,
};