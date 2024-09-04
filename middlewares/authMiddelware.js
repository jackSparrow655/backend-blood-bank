const JWT = require('jsonwebtoken');



module.exports.authMiddelware =  async (req, res, next) => {
  try {
    // console.log("auth started")
    // const token = req.headers["authorization"].split(" ")[1];
    // console.log(req.cookies);
    // console.log("headers", req.headers['cookie'].replace("token=", ""))
    // console.log("req.cookies", req.cookies)
    const token = req.headers['authorization']?.replace("Bearer ", "") || req.headers['cookie']?.replace("token=", "")
    // console.log("token = ", token)
    
    // console.log("token->", token)
    const payload = JWT.verify(token, process.env.JWT_SECRET)
    req.payload = payload;
    console.log("auth middleware passsed")
    next()
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message1: error.message,
      message2: "Auth Failedd",
    });
  }
};

