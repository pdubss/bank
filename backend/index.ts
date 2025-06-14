import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import transactionRoutes from "./routes/transactionRoutes";
import authRoutes from "./routes/authRoutes";

dotenv.config({ path: "../.env" });
const app = express();

//middleware
app.use(cors());
app.use(express.json()); // allows us to access req.body

//routes
app.use("/users", userRoutes);
app.use("/transactions", transactionRoutes);
app.use("/auth", authRoutes);

//get friends
app.post("/users/:id/friends", (req, res) => {
  const { id } = req.params;
  res.status(400).json({
    id,
  });
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
