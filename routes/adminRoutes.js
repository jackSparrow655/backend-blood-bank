const express = require("express");
const {authMiddelware} = require("../middlewares/authMiddelware");
const {
    getDonarsListController,
    getHospitalListController,
    getOrgListController,
    deleteDonarController,
} = require("../controllers/adminController");
const adminMiddleware = require("../middlewares/adminMiddleware");
const { isAuthorized } = require("../middlewares/authorization");

//router object
const router = express.Router();

//Routes

router.get('/test', (req, res) => {
    return res.status(200).json({
        success:true,
        message:"this router is runnig well baby"
    })
}) 

//GET || DONAR LIST
router.get('/donar-list',authMiddelware, isAuthorized("admin", "organisation"), getDonarsListController)
// //GET || HOSPITAL LIST
router.get('/hospital-list',authMiddelware,isAuthorized("admin", "organisation"),getHospitalListController)
// //GET || ORG LIST
router.get('/org-list', authMiddelware, isAuthorized("admin", "organisation"), getOrgListController);
// // ==========================

// // DELETE DONAR || GET
router.delete('/delete-donar/:id',authMiddelware,isAuthorized("admin", "organisation"), deleteDonarController)

//EXPORT
module.exports = router;
