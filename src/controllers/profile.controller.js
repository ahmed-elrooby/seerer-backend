import userModel from "../model/user.model.js";
import healthcareFacilityModel from "../model/healthcareFacility.model.js";
import AppError from "../utils/AppError.js";

const getProfile = async (req, res, next) => {
  try {
    const user = await userModel
      .findById(req.user.userId)
      .select("-password");

    if (!user) {
      return next(new AppError("المستخدم غير موجود", 404));
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
    const { user: userData, facility: facilityData } = req.body;

    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return next(new AppError("المستخدم غير موجود", 404));
    }

    // 1. تحديث بيانات الحساب
    if (userData !== undefined) {
      if (
        !userData ||
        typeof userData !== "object" ||
        Array.isArray(userData)
      ) {
        return next(
          new AppError("بيانات الحساب غير صحيحة", 400)
        );
      }

      const allowedUserFields = ["name", "email"];

      const invalidUserField = Object.keys(userData).some(
        (key) => !allowedUserFields.includes(key)
      );

      if (invalidUserField) {
        return next(
          new AppError("توجد حقول غير مسموح بتعديلها", 400)
        );
      }

      if (userData.name !== undefined) {
        if (
          typeof userData.name !== "string" ||
          !userData.name.trim()
        ) {
          return next(
            new AppError("الاسم مطلوب", 400)
          );
        }

        user.name = userData.name.trim();
      }

      if (userData.email !== undefined) {
        if (
          typeof userData.email !== "string" ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            userData.email.trim()
          )
        ) {
          return next(
            new AppError("البريد الإلكتروني غير صحيح", 400)
          );
        }

        const email = userData.email.trim().toLowerCase();

        if (email !== user.email) {
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

        user.email = email;
      }

      await user.save();
    }

    // 2. تحديث بيانات المنشأة الخاصة بمدير المستشفى فقط
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

      if (facilityData !== undefined) {
        if (
          !facilityData ||
          typeof facilityData !== "object" ||
          Array.isArray(facilityData)
        ) {
          return next(
            new AppError("بيانات المنشأة غير صحيحة", 400)
          );
        }

        // عدّل القائمة لتطابق الحقول الموجودة في الموديل عندك
        const allowedFacilityFields = [
          "name",
          "address",
          "phone",
        ];

        const invalidFacilityField = Object.keys(
          facilityData
        ).some(
          (key) => !allowedFacilityFields.includes(key)
        );

        if (invalidFacilityField) {
          return next(
            new AppError(
              "توجد بيانات غير مسموح بتعديلها",
              400
            )
          );
        }

        for (const field of allowedFacilityFields) {
          if (facilityData[field] !== undefined) {
            if (
              typeof facilityData[field] !== "string" ||
              !facilityData[field].trim()
            ) {
              return next(
                new AppError(
                  `قيمة الحقل ${field} غير صحيحة`,
                  400
                )
              );
            }

            facility[field] = facilityData[field].trim();
          }
        }

        await facility.save();
      }
    } else if (facilityData !== undefined) {
      return next(
        new AppError(
          "غير مسموح لك بتعديل بيانات المنشأة",
          403
        )
      );
    }

    return res.status(200).json({
      success: true,
      message: "تم تحديث البيانات بنجاح",
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

export { getProfile, updateProfile };
