const User = require("../models/userModel");
module.exports = async (req, res, next) => {
  try {
    const {id} = req.payload
    const user = await User.findById(id);
    //check admin
    if (user?.role !== "admin") {
      return res.status(401).send({
        success: false,
        message: "this is protected route for admin only",
      });
    } else {
        console.log("admin confirmed in middleware")
      next();
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "Auth Failed, ADMIN API",
      error,
    });
  }
};
