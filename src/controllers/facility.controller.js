
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import healthcareFacilityModel from "../model/healthcareFacility.model.js";
import userModel from "../model/user.model.js";
import unitModel from "../model/unit.model.js";

import AppError from "../utils/AppError.js";

const createFacility = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const {
      name,
      phone,
      country,
      address,
      city,
      governorate,
      location,
      services,

      adminName,
      adminEmail,
      adminPassword,
    } = req.body;

    // التأكد إن الإيميل غير مستخدم
    const existingUser = await userModel.findOne({
      email: adminEmail,
    });

    if (existingUser) {
      throw new AppError(
        "البريد الإلكتروني مستخدم بالفعل",
        400
      );
    }

    // تشفير الباسورد
    const hashedPassword = await bcrypt.hash(
      adminPassword,
      10
    );

    // إنشاء المنشأة الطبية
    const facilityResult =
      await healthcareFacilityModel.create(
        [
          {
            name,
            phone,
            country,
            address,
            city,
            governorate,
            location,
            services,
          },
        ],
        { session }
      );

    const facility = facilityResult[0];

    // إنشاء حساب مسؤول المستشفى
    const adminResult = await userModel.create(
      [
        {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: "hospital_admin",
          facilityId: facility._id,
          isActive: true,
        },
      ],
      { session }
    );

    const admin = adminResult[0];

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "تم إضافة المستشفى وحساب المسؤول بنجاح",
      data: {
        facility,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          facilityId: admin.facilityId,
          isActive: admin.isActive,
        },
      },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

const getFacilities = async (req, res, next) => {
  try {
    const facilities = await healthcareFacilityModel.aggregate([
      {
        $lookup: {
          from: "units",
          localField: "_id",
          foreignField: "facilityId",
          as: "units",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { facilityId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$facilityId", "$$facilityId"],
                    },
                    {
                      $eq: ["$role", "hospital_admin"],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                email: 1,
                isActive: 1,
                createdAt: 1,
              },
            },
          ],
          as: "admin",
        },
      },
      {
        $unwind: {
          path: "$admin",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      facilities,
    });
  } catch (error) {
    next(error);
  }
};

const getFacilityById = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(
        new AppError(
          "معرف المنشأة الطبية غير صحيح",
          400
        )
      );
    }

    const facilities =
      await healthcareFacilityModel.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(id),
          },
        },

        // الوحدات
        {
          $lookup: {
            from: "units",
            localField: "_id",
            foreignField: "facilityId",
            as: "units",
          },
        },

        // مسؤول المستشفى
        {
          $lookup: {
            from: "users",
            let: { facilityId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      {
                        $eq: [
                          "$facilityId",
                          "$$facilityId",
                        ],
                      },
                      {
                        $eq: [
                          "$role",
                          "hospital_admin",
                        ],
                      },
                    ],
                  },
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  email: 1,
                  isActive: 1,
                  createdAt: 1,
                },
              },
            ],
            as: "admin",
          },
        },

        {
          $unwind: {
            path: "$admin",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

    if (!facilities.length) {
      return next(
        new AppError(
          "المنشأة الطبية غير موجودة",
          404
        )
      );
    }

    return res.status(200).json({
      success: true,
      facility: facilities[0],
    });
  } catch (error) {
    next(error);
  }
};

const updateFacility = async (req, res, next) => {
  const { id } = req.params;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        "معرف المنشأة الطبية غير صحيح",
        400
      );
    }

    const {
      name,
      phone,
      country,
      address,
      city,
      governorate,
      location,
      services,

      adminName,
      adminEmail,
      adminPassword,
    } = req.body;

    const facility =
      await healthcareFacilityModel
        .findById(id)
        .session(session);

    if (!facility) {
      throw new AppError(
        "المنشأة الطبية غير موجودة",
        404
      );
    }

    // =========================
    // تحديث بيانات المنشأة
    // =========================

    if (name !== undefined) {
      facility.name = name;
    }

    if (phone !== undefined) {
      facility.phone = phone;
    }

    if (country !== undefined) {
      facility.country = country;
    }

    if (address !== undefined) {
      facility.address = address;
    }

    if (city !== undefined) {
      facility.city = city;
    }

    if (governorate !== undefined) {
      facility.governorate = governorate;
    }

    if (location !== undefined) {
      facility.location = location;
    }

    if (services !== undefined) {
      facility.services = services;
    }

    await facility.save({ session });

    // =========================
    // البحث عن مسؤول المستشفى
    // =========================

    let admin = await userModel
      .findOne({
        facilityId: facility._id,
        role: "hospital_admin",
      })
      .session(session);

    if (admin) {
      // تحديث اسم المسؤول
      if (adminName !== undefined) {
        admin.name = adminName;
      }

      // تحديث الإيميل
      if (adminEmail !== undefined) {
        const existingUser =
          await userModel
            .findOne({
              email: adminEmail,
              _id: { $ne: admin._id },
            })
            .session(session);

        if (existingUser) {
          throw new AppError(
            "البريد الإلكتروني مستخدم بالفعل",
            400
          );
        }

        admin.email = adminEmail;
      }

      // تحديث الباسورد
      if (adminPassword !== undefined) {
        admin.password = await bcrypt.hash(
          adminPassword,
          10
        );
      }

      await admin.save({ session });
    }

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "تم تحديث بيانات المستشفى بنجاح",
      data: {
        facility,
        admin: admin
          ? {
              id: admin._id,
              name: admin.name,
              email: admin.email,
              role: admin.role,
              facilityId: admin.facilityId,
              isActive: admin.isActive,
            }
          : null,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

const updateFacilityStatus = async (
  req,
  res,
  next
) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        "معرف المنشأة الطبية غير صحيح",
        400
      );
    }

    if (typeof isActive !== "boolean") {
      throw new AppError(
        "حالة المنشأة يجب أن تكون true أو false",
        400
      );
    }

    const facility =
      await healthcareFacilityModel
        .findById(id)
        .session(session);

    if (!facility) {
      throw new AppError(
        "المنشأة الطبية غير موجودة",
        404
      );
    }

    facility.isActive = isActive;

    await facility.save({ session });

    // نفس الحالة على حساب المسؤول
    await userModel.updateMany(
      {
        facilityId: facility._id,
        role: "hospital_admin",
      },
      {
        $set: {
          isActive,
        },
      },
      { session }
    );

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: isActive
        ? "تم تفعيل المستشفى وحساب المسؤول بنجاح"
        : "تم تعطيل المستشفى وحساب المسؤول بنجاح",
      data: {
        id: facility._id,
        isActive: facility.isActive,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

const deleteFacility = async (req, res, next) => {
  const { id } = req.params;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(
        "معرف المنشأة الطبية غير صحيح",
        400
      );
    }

    const facility =
      await healthcareFacilityModel
        .findById(id)
        .session(session);

    if (!facility) {
      throw new AppError(
        "المنشأة الطبية غير موجودة",
        404
      );
    }

    // حذف حساب مسؤول المستشفى
    await userModel.deleteMany(
      {
        facilityId: facility._id,
        role: "hospital_admin",
      },
      { session }
    );

    // حذف الوحدات التابعة للمستشفى
    await unitModel.deleteMany(
      {
        facilityId: facility._id,
      },
      { session }
    );

    // حذف المستشفى
    await facility.deleteOne({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message:
        "تم حذف المستشفى وحساب المسؤول والوحدات التابعة لها بنجاح",
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

export {
  createFacility,
  getFacilities,
  getFacilityById,
  updateFacility,
  updateFacilityStatus,
  deleteFacility,
};
