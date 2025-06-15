import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config({ path: "../.env" });
const app = express();

//middleware
app.use(cors({ origin: "https://bank-04wm.onrender.com", credentials: true }));
app.use(express.json()); // allows us to access req.body

//routes
app.use("/users", userRoutes);
app.use("/transactions", transactionRoutes);
app.use("/auth", authRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
