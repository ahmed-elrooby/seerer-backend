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
          userData.name.trim().length < 2 ||
          userData.name.trim().length > 100
        ) {
          return next(
            new AppError("الاسم يجب أن يكون من 2 إلى 100 حرف", 400)
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

    // 2. تحديث بيانات المنشأة لمدير المستشفى فقط
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

        const allowedFacilityFields = [
          "name",
          "phone",
          "address",
          "location",
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

        // تحديث اسم المنشأة ورقم الهاتف والعنوان
        for (const field of ["name", "phone", "address"]) {
          if (facilityData[field] !== undefined) {
            const value = facilityData[field];

            if (
              typeof value !== "string" ||
              !value.trim()
            ) {
              return next(
                new AppError(
                  `قيمة الحقل ${field} غير صحيحة`,
                  400
                )
              );
            }

            facility[field] = value.trim();
          }
        }

        // تحديث الموقع الجغرافي GeoJSON
        if (facilityData.location !== undefined) {
          const { location } = facilityData;

          if (
            !location ||
            typeof location !== "object" ||
            location.type !== "Point" ||
            !Array.isArray(location.coordinates) ||
            location.coordinates.length !== 2
          ) {
            return next(
              new AppError(
                "بيانات الموقع الجغرافي غير صحيحة",
                400
              )
            );
          }

          const [longitude, latitude] = location.coordinates;

          if (
            typeof longitude !== "number" ||
            typeof latitude !== "number" ||
            !Number.isFinite(longitude) ||
            !Number.isFinite(latitude) ||
            longitude < -180 ||
            longitude > 180 ||
            latitude < -90 ||
            latitude > 90
          ) {
            return next(
              new AppError(
                "إحداثيات الموقع الجغرافي غير صحيحة",
                400
              )
            );
          }

          facility.location = {
            type: "Point",
            coordinates: [longitude, latitude],
          };
        }

        // حفظ بيانات المنشأة في MongoDB
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

    // 3. الاستجابة النهائية
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
