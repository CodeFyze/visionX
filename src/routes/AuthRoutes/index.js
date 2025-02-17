const express = require("express");
const router = express.Router();
const {
  register,
  login,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} = require("./../../controllers/AuthControllers");

router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/verify-reset-code", verifyResetCode);

router.post("/reset-password", resetPassword);

module.exports = router;
