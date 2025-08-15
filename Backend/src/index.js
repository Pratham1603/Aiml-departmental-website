import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import cookieParser from "cookie-parser";
import homepageRoutes from "./routes/homepage.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import facultyRoutes from "./routes/faculty.routes.js";
import nonfacultyRoutes from "./routes/nonfaculty.routes.js";
import eventRoutes from "./routes/event.routes.js";
import memberRoutes from "./routes/member.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import aluminiRoutes from "./routes/alumini.routes.js";
import academicsRoutes from "./routes/academics.routes.js";
import studentRoutes from "./routes/student.routes.js";
import resultRoutes from "./routes/result.routes.js";
import analysisRoutes from "./routes/anlyatics.routes.js";
import { fileURLToPath } from "url";
import path from "path";
import { createServer } from "http";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// configs
dotenv.config({ path: "./.env" });

const app = express();
const server = createServer(app);

// ✅ Allow multiple origins for both local dev & prod
const allowedOrigins = process.env.CORS_ORIGIN.split(",");

// ✅ Express CORS setup
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow requests without origin (curl, mobile)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ✅ Socket.IO setup with CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// parsing form-data ,json ,urlencodeded ...
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(cookieParser()); // middleware to parse cookies

// homepage routes
app.use("/api/homepage", homepageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/nonfaculty", nonfacultyRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/member", memberRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/alumini", aluminiRoutes);
app.use("/api/academics", academicsRoutes);
app.use("/api/placed-student", studentRoutes);
app.use("/api/result", resultRoutes);
app.use("/api/analysis", analysisRoutes);

// Serve static files from React build
app.use(express.static(path.join(__dirname, "../../Frontend/dist")));
app.get("*", (req, res, next) => {
  if (req.originalUrl.startsWith("/api")) return next();
  res.sendFile(path.join(__dirname, "../../Frontend/dist/index.html"));
});

// WebSocket Logic 
let connectionCount = 0;
io.on("connection", (socket) => {
  connectionCount++;
  console.log(`Client connected via WebSocket. Connection count: ${connectionCount}`);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Attach `io` to `app` so it can be accessed in controllers
app.set("io", io);

// DB connection and server start
connectDB()
  .then(() => {
    server.listen(process.env.PORT || 9000, () => {
      console.log(`Server is running at Port: ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection Failed!!! ", err);
  });
