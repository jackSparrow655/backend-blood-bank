const express = require("express");
const router = express.Router();

const {authMiddelware} = require("../middlewares/authMiddelware");
const {bloodGroupDetailsContoller} = require("../controllers/analyticsController");



//routes

router.get('/test', (req, res) => {
    return res.status(200).json({
        success: true,
        message: "this route is runnig well baby"
    })
})

//GET BLOOD DATA
router.get("/bloodGroups-data", authMiddelware, bloodGroupDetailsContoller);

module.exports = router;
