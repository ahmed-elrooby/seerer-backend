import healthcareFacilityModel from "../model/healthcareFacility.model.js";
import unitModel from "../model/unit.model.js";
import AppError from "../utils/AppError.js";

const createUnit = async (req, res, next) => {
  try {
    const { name, type, availableBeds } = req.body;

    const facility = await healthcareFacilityModel.findById(
      req.user.facilityId
    );

    if (!facility) {
      return next(
        new AppError("المنشأة الطبية غير موجودة", 404)
      );
    }

    if (!facility.services.includes(type)) {
      return next(
        new AppError(
          "هذه الخدمة غير مفعلة لهذه المنشأة الطبية",
          400
        )
      );
    }

    const existingUnit = await unitModel.findOne({
      facilityId: req.user.facilityId,
      type,
    });

    if (existingUnit) {
      return next(
        new AppError(
          "هذه الوحدة موجودة بالفعل في المنشأة الطبية",
          400
        )
      );
    }

    const unit = new unitModel({
      facilityId: req.user.facilityId,
      name,
      type,
      availableBeds,
    });

    await unit.save();

    res.status(201).json({
      success: true,
      message: "تم إضافة الوحدة بنجاح",
      data: unit,
    });
  } catch (error) {
    next(error);
  }
};

const getUnits = async (req, res, next) => {
  try {
    const units = await unitModel.find({
      facilityId: req.user.facilityId,
    });

    res.status(200).json({
      success: true,
      data: units,
    });
  } catch (error) {
    next(error);
  }
};

const getUnitById = async (req, res, next) => {
  try {
    const unit = await unitModel.findOne({
      _id: req.params.id,
      facilityId: req.user.facilityId,
    });

    if (!unit) {
      return next(
        new AppError("الوحدة غير موجودة", 404)
      );
    }

    res.status(200).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    next(error);
  }
};

const updateUnit = async (req, res, next) => {
  try {
    const unit = await unitModel.findOne({
      _id: req.params.id,
      facilityId: req.user.facilityId,
    });

    if (!unit) {
      return next(
        new AppError("الوحدة غير موجودة", 404)
      );
    }

    const facility = await healthcareFacilityModel.findById(
      req.user.facilityId
    );

    if (!facility) {
      return next(
        new AppError("المنشأة الطبية غير موجودة", 404)
      );
    }

    if (
      req.body.type &&
      !facility.services.includes(req.body.type)
    ) {
      return next(
        new AppError(
          "هذه الخدمة غير مفعلة لهذه المنشأة الطبية",
          400
        )
      );
    }

    if (req.body.type && req.body.type !== unit.type) {
      const existingUnit = await unitModel.findOne({
        facilityId: req.user.facilityId,
        type: req.body.type,
        _id: { $ne: unit._id },
      });

      if (existingUnit) {
        return next(
          new AppError(
            "هذه الوحدة موجودة بالفعل في المنشأة الطبية",
            400
          )
        );
      }
    }

    Object.assign(unit, req.body);

    await unit.save();

    res.status(200).json({
      success: true,
      message: "تم تحديث الوحدة بنجاح",
      data: unit,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUnit = async (req, res, next) => {
  try {
    const unit = await unitModel.findOne({
      _id: req.params.id,
      facilityId: req.user.facilityId,
    });

    if (!unit) {
      return next(
        new AppError("الوحدة غير موجودة", 404)
      );
    }

    await unit.deleteOne();

    res.status(200).json({
      success: true,
      message: "تم حذف الوحدة بنجاح",
    });
  } catch (error) {
    next(error);
  }
};

export {
  createUnit,
  getUnits,
  getUnitById,
  updateUnit,
  deleteUnit,
};