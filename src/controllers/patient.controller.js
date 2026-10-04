import healthcareFacilityModel from "../model/healthcareFacility.model.js";

const searchNearbyFacilities = async (req, res, next) => {
  try {
    const { type, lat, lng } = req.query;

    const latitude = Number(lat);
    const longitude = Number(lng);

    const facilities = await healthcareFacilityModel.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },

          key: "location",

          distanceField: "distance",

          spherical: true,

          query: {
            isActive: true,
            services: type,
          },
        },
      },

      {
        $lookup: {
          from: "units",

          let: {
            facilityId: "$_id",
          },

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
                      $eq: ["$type", type],
                    },

                    {
                      $eq: ["$isActive", true],
                    },

                    {
                      $gt: [
                        "$availableBeds",
                        0,
                      ],
                    },
                  ],
                },
              },
            },
          ],

          as: "units",
        },
      },

      {
        $match: {
          "units.0": {
            $exists: true,
          },
        },
      },

      {
        $project: {
          _id: 1,

          name: 1,

          phone: 1,

          address: 1,

          city: 1,

          governorate: 1,

          location: 1,

          distance: {
            $divide: [
              "$distance",
              1000,
            ],
          },

          unit: {
            $arrayElemAt: [
              "$units",
              0,
            ],
          },
        },
      },

      {
        $project: {
          _id: 1,

          name: 1,

          phone: 1,

          address: 1,

          city: 1,

          governorate: 1,

          location: 1,

          distance: 1,

          unit: {
            _id: 1,
            name: 1,
            type: 1,
            availableBeds: 1,
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: facilities.length,
      data: facilities,
    });
  } catch (error) {
    next(error);
  }
};

export {
  searchNearbyFacilities,
};