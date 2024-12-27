import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import httpStatus from "http-status";
import routes from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import config from "./config";

const app: Application = express();

// use middlewares
// app.use(
//   cors({
//     origin: ["http://localhost:3000", "https://elp-client.vercel.app/"],
//     credentials: true,
//   })
// );

const allowedOrigins =
  config.env === "development"
    ? [
        "http://localhost:3000",
        "https://bdjob-preparation.vercel.app",
        "https://bd-job-preparation.vercel.app",
        "https://checkout.stripe.com",
      ]
    : [
        "https://bdjob-preparation.vercel.app",
        "https://bd-job-preparation.vercel.app",
        "https://checkout.stripe.com",
      ];

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? "*" : allowedOrigins,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// use router
app.use("/api/v1", routes);

// global error handler
app.use(globalErrorHandler);

// handle not found
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "Not Found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API not found!",
      },
    ],
  });
  next();
});

export default app;
