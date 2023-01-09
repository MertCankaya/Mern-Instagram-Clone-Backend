const express = require("express");
const { body } = require("express-validator");
const User = require("../models/user");
const authController = require("../controllers/auth");

const router = express.Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("please enter a valid email.")
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject("E-Mail address already exist!");
        }
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 1 }),
  ],
  authController.signup
);

router.post("/login", authController.login);

module.exports = router;
