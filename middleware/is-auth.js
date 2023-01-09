const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new Error("Not authenticated!");
    next(error);
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "supersecretkey");
  } catch (error) {
    next(error);
  }
  if (!decodedToken) {
    const error = new Error("Not authenticated!");
    next(error);
  }
  req.userId = decodedToken.userId;
  next();
};
