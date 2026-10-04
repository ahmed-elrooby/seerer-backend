import { Schema, model } from "mongoose";

const unitSchema = new Schema(
  {
    facilityId: {
      type: Schema.Types.ObjectId,
      ref: "HealthcareFacility",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["NICU", "ICU"],
      required: true,
    },

    availableBeds: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Unit", unitSchema);