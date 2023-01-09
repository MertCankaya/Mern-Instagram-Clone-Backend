const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed!");
    error.statusCode = 422;
    next(error);
  }
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const profilePic = req.body.profilePic;
  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      password: hashedPassword,
      email,
      name,
      profilePic,
    });
    const result = await user.save();
    res.status(201).json({ result });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User doesn't exist!");
      error.statusCode = 401;
      throw error
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error("Wrong password!");
      error.statusCode = 401;
      throw error
    }
    const token = jwt.sign(
      { email: user.email, userId: user._id.toString() },
      "supersecretkey",
      { expiresIn: "24h" }
    );
    res.status(200).json({ token, user: user._id.toString() });
  } catch (error) {
    next(error);
  }
};
