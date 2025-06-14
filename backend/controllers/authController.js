import pool from "../server/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      "SELECT password, first_name,last_name, id, phone FROM users WHERE email = $1",
      [email],
    );
    if (result.rows.length === 0) {
      res.status(400).json({ error: "No user with that email found" });
    }
    const user = result.rows[0];

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      res.status(400).json({ error: "Wrong password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30m",
      },
    );

    res.status(200).json({
      message: "Login successful",
      token,
      firstName: user.first_name,
      lastName: user.last_name,
      email,
      phone: user.phone,
      id: user.id,
    });
  } catch (error) {
    next(error);
    // console.error("Error during login:", error);
    // res.status(500).json({ error: "An error occurred" });
  }
};

export const autoLogin = async (req, res) => {
  const { email } = req.body;
  if (email !== req.user.email) {
    return res
      .status(400)
      .json({ message: "Submitted email and target email do not match" });
  }

  try {
    const user = await pool.query(
      "SELECT id, first_name, last_name, phone, email FROM users WHERE email = $1",
      [email],
    );
    res.status(200).json({ status: "success", user: user.rows[0] });
  } catch (error) {
    console.error(error);
  }
};
