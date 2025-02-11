const express = require("express");
const Users = require("../../models/UserModel");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcryptjs");
// const { nanoid } = require("nanoid");
// import { nanoid } from "nanoid";
const { mailSender } = require("../../utils/mailSender");

const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a 6-digit code
};

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name) {
    return res.status(401).send({
      message: "Name is required",
      status: "fail",
      user: null,
    });
  }
  if (!email) {
    return res.status(401).send({
      message: "Email is required",
      status: "fail",
      user: null,
    });
  }
  if (!password) {
    return res.status(401).send({
      message: "Password is required",
      status: "fail",
      user: null,
    });
  }
  try {
    let findUserWithEmail = await Users.findOne({ email });
    if (findUserWithEmail) {
      return res.status(402).send({
        status: "fail",
        message: "Email already exist!",
        user: null,
      });
    }
    const user = new Users({ name, email, password });
    await user.save();
    let token = jwt.sign({ _id: user._id.toString() }, "visionx-secret-key");
    // const { name, email, _id } = user;
    return res.status(201).send({
      message: "User successfully registered.",
      user: { _id: user._id, name: user.name, email: user.email, token },
    });
  } catch (error) {
    return res.status(400).send({
      status: "fail",
      message: "Unable to register user, try again later!",
      error,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(401).send({
        message: "Email is required!",
        status: "fail",
        user: null,
      });
    }
    if (!password) {
      return res.status(401).send({
        message: "Password is required",
        status: "fail",
        user: null,
      });
    }
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).send({
        message: "No user found with this email",
        status: "fail",
        user: null,
      });
    }

    if (user) {
      let isCorrectPassword = await bcrypt.compare(password, user.password);
      if (!isCorrectPassword) {
        return res.status(402).send({
          message: "Email or password is incorrect",
          status: "fail",
          user: null,
        });
      }
    }

    let token = await jwt.sign({ _id: user._id }, "visionx-secret-key");
    let obj = { ...user };
    return res.status(200).send({
      status: "Success",
      message: "Login succesfully",
      user: { ...user._doc, token },
    });
  } catch (error) {
    console.log("Error => ", error);

    return res.status(400).send({
      message: "Unable to login",
      status: "fail",
      error,
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send({
      message: "Email is required",
      status: "fail",
    });
  }

  try {
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).send({
        message: "No user found with this email",
        status: "fail",
      });
    }

    // Generate a 6-digit code
    const resetCode = generateResetCode();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send the code to the user's email
    const body = `Your password reset code is: ${resetCode}\n\nThis code will expire in 1 hour.`;
    const subject = `Reset your password!`;
    await mailSender(user.email, subject, body);

    return res.status(200).send({
      message: "Reset code sent to your email",
      status: "success",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to process forgot password request",
      status: "fail",
      error,
    });
  }
});

router.post("/verify-reset-code", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).send({
      message: "Email and code are required",
      status: "fail",
    });
  }

  try {
    const user = await Users.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() }, // Check if the code is still valid
    });

    if (!user) {
      return res.status(400).send({
        message: "Invalid or expired code",
        status: "fail",
      });
    }

    return res.status(200).send({
      message: "Code verified successfully",
      status: "success",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to verify reset code",
      status: "fail",
      error,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!email || !code || !newPassword) {
    return res.status(400).send({
      message: "Email, code, and new password are required",
      status: "fail",
    });
  }

  try {
    const user = await Users.findOne({
      email,
      resetPasswordCode: code,
      resetPasswordExpires: { $gt: Date.now() }, // Check if the code is still valid
    });

    if (!user) {
      return res.status(400).send({
        message: "Invalid or expired code",
        status: "fail",
      });
    }

    // Hash the new password
    // const hashedPassword = await bcrypt.hash(newPassword, 8);
    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).send({
      message: "Password reset successfully",
      status: "success",
    });
  } catch (error) {
    return res.status(500).send({
      message: "Unable to reset password",
      status: "fail",
      error,
    });
  }
});

module.exports = router;
