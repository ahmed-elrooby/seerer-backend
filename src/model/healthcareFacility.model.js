import { Schema, model } from "mongoose";

const healthcareFacilitySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    governorate: {
      type: String,
      trim: true,
      default: "",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },

      coordinates: {
        type: [Number],
        required: true,
      },
    },

    services: {
      type: [
        {
          type: String,
          enum: ["NICU", "ICU"],
        },
      ],
      default: [],
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

healthcareFacilitySchema.index({
  location: "2dsphere",
});

export default model(
  "HealthcareFacility",
  healthcareFacilitySchema
);

