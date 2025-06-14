import pool from "../server/db";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

import { Request, Response } from "express";

export const getUser = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (response.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const id = response.rows[0].id;

    const financialResponse = await pool.query(
      "SELECT account_number, balance, loan_amount, loan_reason from financialinfo WHERE user_id = $1",
      [id],
    );
    const { account_number, balance, loan_amount, loan_reason } =
      financialResponse.rows[0];
    res
      .status(200)
      .json({ account_number, balance, loan_amount, loan_reason, id });
  } catch (error) {
    console.error(error.message);
  }
};

export const createUser = async (req, res) => {
  const { firstName, lastName, email, password, ssn, phone } = req.body;
  const algorithm = "aes-256-cbc";
  const encryptionKey = crypto.randomBytes(32); // Must be 32 characters
  const iv = crypto.randomBytes(16);

  const encryptSSN = (ssn) => {
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
    let encrypted = cipher.update(ssn);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  };

  try {
    const existingEmail = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (existingEmail?.rowCount && existingEmail.rowCount > 0) {
      return res
        .status(409)
        .json({ error: "User with that email already exists, please login" });
    }
    const existingPhone = await pool.query(
      "SELECT * from users WHERE phone = $1",
      [phone],
    );

    if (existingPhone?.rowCount && existingPhone.rowCount > 0) {
      return res
        .status(410)
        .json({ message: "User with that phone number already exists" });
    }

    const encryptedSSN = encryptSSN(ssn);
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await pool.query(
      "INSERT INTO users (first_name, last_name, email, password, ssn, phone) VALUES($1,$2,$3,$4,$5,$6) RETURNING id, first_name, last_name, email, phone",
      [firstName, lastName, email, hashedPassword, encryptedSSN, phone],
    );

    const generateAccountNumber = async () => {
      let accountNumber;
      let exists;
      do {
        accountNumber = Math.floor(100000000000 + Math.random() * 900000000000); // generates a random 12-digit number
        exists = await pool.query(
          "SELECT 1 FROM financialinfo WHERE account_number = $1",
          [accountNumber],
        );
      } while (exists.rows.length > 0); // Ensure uniqueness
      return accountNumber;
    };

    const accountNumber = await generateAccountNumber();

    const financials = await pool.query(
      "INSERT INTO financialinfo (user_id, account_number, balance, loan_amount, loan_reason) values($1, $2, $3, $4, $5) RETURNING account_number, balance, loan_amount, loan_reason",
      [newUser.rows[0].id, accountNumber, 0, 0, ""],
    );

    const token = jwt.sign(
      {
        id: newUser.rows[0].id,
        email,
        firstName: newUser.rows[0].first_name,
        lastName: newUser.rows[0].last_name,
        phone: newUser.rows[0].phone,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30m",
      },
    );

    res.status(201).json({
      user: newUser.rows[0],
      financials: financials.rows[0],
      token,
    });
  } catch (error) {
    console.error(error.message);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    await pool.query("DELETE from users WHERE id = $1", [id]);
    res.json(`user ${id} was deleted`);
  } catch (error) {
    console.error(error.message);
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    const user = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rowCount === 0) {
      res.status(200);
    }
    const userID = user.rows[0].id;
    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: '"MyApp Support" <support@myapp.com>',
      to: email,
      subject: "Your Password Reset Code",
      text: `Here is your password reset code: ${code}`,
      html: `<p>Your password reset code is: <strong>${code}</strong></p>`,
    });

    await pool.query(
      "INSERT INTO password_resets (user_id, code, expires_at) VALUES ($1,$2,$3) ON CONFLICT(user_id) DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at, created_at = NOW()",
      [userID, code, expiresAt],
    );
    res.status(200).json({ message: "Email sent" });
  } catch (error) {
    console.error(error.message);
  }
};

export const updatePassword = async (req, res) => {
  const { code, password, confirmPassword } = req.body.data;
  const { email } = req.body;
  console.log(code, password, confirmPassword, email);
  if (password !== confirmPassword) {
    return res.status(400).json({
      message: "Passwords do not match",
    });
  }
  try {
    const user = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    const userID = user.rows[0].id;

    const codeQuery = await pool.query(
      "SELECT code, expires_at FROM password_resets WHERE user_id = $1",
      [userID],
    );
    const dbCode = codeQuery.rows[0].code;
    const expiresAt = codeQuery.rows[0].expires_at;

    if (new Date(expiresAt) < new Date()) {
      return res.status(402).json({ message: "Code expired" });
    }

    if (code !== dbCode) {
      return res.status(401).json({
        message: "Invalid code",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password=$1", [hashedPassword]);

    res.status(200).end();
  } catch (error) {
    console.error(error.message);
  }
};

export const addFriend = async (req, res) => {
  const { friend, id } = req.body;
  console.log(friend, id);
  if (!friend) res.status(400).json({ message: "Incomplete form submitted" });

  const user = await pool.query(
    "SELECT email, phone FROM users WHERE id = $1",
    [id],
  );
  const userEmail = user.rows[0].email;
  const userPhone = user.rows[0].phone;

  if (friend.phone === userPhone) {
    return res
      .status(403)
      .json({ message: "Cannot add your own phone number" });
  }
  if (friend.email === userEmail) {
    return res.status(405).json({ message: "Cannot add your own email" });
  }

  const existingFriend = await pool.query(
    "SELECT * FROM friends WHERE (email = $1 or phone = $2) AND user_id = $3  ",
    [friend.email, friend.phone, id],
  );
  if (existingFriend.rowCount && existingFriend.rowCount > 0) {
    return res.status(400).json({ message: "This friend already exists" });
  }

  await pool.query(
    "INSERT INTO friends (first_name,last_name,phone, email, user_id) VALUES($1,$2,$3,$4,$5)",
    [friend.first_name, friend.last_name, friend.phone, friend.email, id],
  );
};

export const updateInfo = async (req, res) => {
  const { firstName, lastName, phone } = req.body;
  const { id } = req.params;

  try {
    await pool.query(
      "UPDATE users SET first_name = $1, last_name =$2, phone =$3 WHERE id = $4",
      [firstName, lastName, phone, id],
    );
    res.status(200).json({ message: "user info updated" });
  } catch (error) {
    console.error(error);
  }
};

export const getFriends = async (req, res) => {
  const { id } = req.params;

  const response = await pool.query(
    "SELECT first_name, last_name, phone, email FROM friends WHERE user_id = $1",
    [id],
  );

  res.status(200).json({
    status: "success",
    friends: response.rows,
  });
};

export const verifyFriend = async (req, res) => {
  const { email } = req.body;
  try {
    const response = await pool.query(
      "SELECT first_name, last_name, email FROM users WHERE email = $1",
      [email],
    );
    if (response.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No friend with this email found" });
    }

    res.status(200).json({ friend: response.rows[0] });
  } catch (error) {
    console.error(error);
  }
};
