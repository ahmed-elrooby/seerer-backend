import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRouter from "./src/routes/auth.route.js";
import facilityRouter from "./src/routes/facility.route.js";
import unitRouter from "./src/routes/unit.route.js";
import patientRouter from "./src/routes/patient.route.js";
import profileRouter from "./src/routes/profile.route.js";
import errorMiddleware from "./src/middleware/error.middleware.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://sereer.vercel.app",
  "https://sreer.net",
  "https://www.sreer.net",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without Origin, such as some mobile/server requests
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/facilities", facilityRouter);
app.use("/api/units", unitRouter);
app.use("/api/patient", patientRouter);
app.use("/api/profile", profileRouter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Seerer API is running",
  });
});

// Error handler must be last
app.use(errorMiddleware);

export default app;