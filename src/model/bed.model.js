import { Schema, model } from "mongoose";

const bedSchema = new Schema(
  {
    unitId: {
      type: Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    bedNumber: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["available", "occupied", "maintenance"],
      default: "available",
    },
  },
  {
    timestamps: true,
  }
);

export default model("Bed", bedSchema);