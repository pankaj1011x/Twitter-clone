import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import connectMongo from "./db/db.js";
const app = express();
dotenv.config();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
  connectMongo();
});
