const express = require("express");
const { testController } = require("../controllers/testController");

//router object
const router = express.Router();

//routes
// router.get("/", testController);

router.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message:"app is running well baby"
    })
})

//export
module.exports = router;
