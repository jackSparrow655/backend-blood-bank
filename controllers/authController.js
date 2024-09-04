const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendToken } = require('../utils/sendToken');

const registerController = async (req, res) => {
  try {
    // console.log(req.body);
    const {email, password, role, name, organisationName, hospitalName, website, address, phone} = req.body
    if(!email || !password || !role || !name || !address || !phone){
        return res.status(400).json({ 
            success: false,
            message: "all field are require man",
            email,
            password,
            role,
            name,
            organisationName,
            hospitalName,
            website,
            address,
            phone
        })
    }
    const exisitingUser = await User.findOne({ email:email });
    //validation
    if (exisitingUser) {
      return res.status(200).send({
        success: false,
        message: "User ALready exists",
      });
    }
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    //rest data
    const user = await User.create({
        email,
        password:hashedPassword,
        role,
        name,
        organisationName,
        hospitalName,
        website,
        address,
        phone
    })
    sendToken(user, 200, res, "regitered successfully")
    
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Register API",
      message2: error.message,
    });
  }
};

//login call back
const loginController = async (req, res) => {
  try {
    const {email, role, password} = req.body
    if(!email || !role || !password){
        return res.status(400).json({
            success:false,
            message: "all fields are required"
        })
    }
    const user = await User.findOne({ email:email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    //check role
    if (user.role !== role) {
      return res.status(500).send({
        success: false,
        message: "role dosent match",
      });
    }
    //compare password
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res.status(500).send({
        success: false,
        message: "password does not matched",
      });
    }
    
    sendToken(user, 200, res, "user logged in successfully")
    
    // const payload = {
    //     id: user._id
    // }
    
    // const token = jwt.sign(payload, process.env.JWT_SECRET, {
    //   expiresIn: "1d",
    // });
    
    // const options = {
    //     expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    //     httpOnly: true,
    //   }
    //   res.cookie("token", token, options).json({
    //     success: true,
    //     message: "user logged in successfully",
    //     token,
    //     user
    //   })
    
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In Login API",
      message1:error.message
    });
  }
};

//GET CURRENT USER
const currentUserController = async (req, res) => {
  try {
    const {id} = req.payload
    if(!id){
        return res.status(400).json({
            success: false,
            message: "id not found"
        })
    }
    // const user = await User.findOne({ _id: id});
    const user = await User.findById(id)
    return res.status(200).send({
      success: true,
      message: "User Fetched Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "unable to get current user",
      error,
    });
  }
};

module.exports = { registerController, loginController, currentUserController };
