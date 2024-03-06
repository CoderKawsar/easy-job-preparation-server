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

const allowedOrigins = [
  "http://localhost:3000",
  "https://elp-client.vercel.app",
  "https://easyjobpreparetion.vercel.app",
  `${config.frontend_site_url}`,
  // Add other allowed origins as needed
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
