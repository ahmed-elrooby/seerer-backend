import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./src/routes/auth.route.js";
import facilityRouter from "./src/routes/facility.route.js";
import unitRouter from "./src/routes/unit.route.js";
import patientRouter from "./src/routes/patient.route.js";
import profileRouter from "./src/routes/profile.route.js";
import errorMiddleware from "./src/middleware/error.middleware.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://sereer.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/facilities", facilityRouter);
app.use("/api/units", unitRouter);
app.use("/api/patient", patientRouter);
app.use("/api/profile", profileRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Seerer API is running",
  });
});

app.use(errorMiddleware);

export default app;