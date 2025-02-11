const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");

    if (token == null) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }
    const decoded = jwt.verify(token, "visionx-secret-key");
    const user = await User.findById(decoded._id);
    if (!user) {
      return res
        .status(403)
        .json({ status: "fail", message: "Forbidden: Invalid token" });
    }
    req.token = token;
    req.user = user;
    req._id = decoded?._id;

    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate !!!" });
  }
};

module.exports = authMiddleware;
