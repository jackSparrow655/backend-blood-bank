const mongoose = require("mongoose");
const Inventory = require("../models/inventoryModel");
const User = require("../models/userModel");

// CREATE INVENTORY
const createInventoryController = async (req, res) => {
  try {
    // console.log(req)
    console.log("createInventory started")
    const email = req.payload.email
    const {bloodGroup, quantity, inventoryType, donarEmail} = req.body
    //validation
    if(!email || !bloodGroup || !quantity || !inventoryType || !donarEmail){
        return res.status(400).json({
            success: false,
            message: "provide all fields"
        })
    }
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User Not Found");
    }
    // if (inventoryType === "in" && user.role !== "donar") {
    //   throw new Error("Not a donar account");
    // }
    // if (inventoryType === "out" && user.role !== "hospital") {
    //   throw new Error("Not a hospital");
    // }

    if (inventoryType == "out") {
      const requestedBloodGroup = bloodGroup;
      const requestedQuantityOfBlood = quantity;
      const organisation = new mongoose.Types.ObjectId(req.payload.id)
      //calculate Blood Quanitity
      const totalInOfRequestedBlood = await Inventory.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "in",
            bloodGroup: requestedBloodGroup,
          },
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" },
          },
        },
      ]);
      // console.log("Total In", totalInOfRequestedBlood);
      const totalIn = totalInOfRequestedBlood[0]?.total || 0;
      //calculate OUT Blood Quanitity

      const totalOutOfRequestedBloodGroup = await Inventory.aggregate([
        {
          $match: {
            organisation,
            inventoryType: "out",
            bloodGroup: requestedBloodGroup,
          },
        },
        {
          $group: {
            _id: "$bloodGroup",
            total: { $sum: "$quantity" },
          },
        },
      ]);
      const totalOut = totalOutOfRequestedBloodGroup[0]?.total || 0;

      //in & Out Calc
      const availableQuanityOfBloodGroup = totalIn - totalOut;
      //quantity validation
      console.log("available=", availableQuanityOfBloodGroup)
      console.log("requested=", quantity)
      if (availableQuanityOfBloodGroup < requestedQuantityOfBlood) {
        return res.status(500).send({
          success: false,
          message: `Only ${availableQuanityOfBloodGroup}ML of ${quantity}ML ${requestedBloodGroup.toUpperCase()} is available`,
        });
      }
    }

    //save record
    const inventory = await Inventory.create({
        inventoryType,
        bloodGroup,
        quantity,
        donarEmail,
        organisation:new mongoose.Types.ObjectId(req.payload.id),
        hospital:inventoryType=="out"?user._id:null,
    })
    return res.status(201).send({
      success: true,
      message: "New Blood Reocrd Added",
      inventory
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Errro In Create Inventory API",
      message2:error.message
    });
  }
};

// GET ALL BLOOD RECORS
const getInventoryControllerOrganisation = async (req, res) => {
  try {
    const {organisationId} = req.body
    if(!organisationId){
        return res.status(400).json({
            success: false,
            message: "please provide organisation"
        })
    }
    const id = new mongoose.Types.ObjectId(organisationId)
    const inventory = await Inventory.find({organisation:id})
      .populate("donar")
      .populate("hospital")
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      messaage: "get all records successfully",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Get All Inventory",
      error,
    });
  }
};

//GET all inventory
const getInventoryController = async(req, res, next) =>{
    try{
      const inventory = await Inventory.find({})
      .populate("hospital")
      .sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message:"all inventories fetched successfully",
        inventory
      })
    } catch(err){
        return res.status(400).json({
            success: false,
            message:"error in inventory controller",
            message2:err.message
        })
    }
}



// GET Hospital BLOOD RECORS
const getInventoryHospitalController = async (req, res) => {
  try {
    const inventory = await Inventory
      .find(req.body.filters)
      .populate("donar")
      .populate("hospital")
      .populate("organisation")
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      messaage: "get hospital comsumer records successfully",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Get consumer Inventory",
      error,
    });
  }
};

// GET BLOOD RECORD OF 3
const getRecentInventoryController = async (req, res) => {
  try {
    const organisationId = req.payload.id
    if(!organisationId){
        return res.status(400).json({
            success: false,
            message:"provide the organisationId"
        })
    }
    const id = new mongoose.Types.ObjectId(organisationId)
    const inventory = await Inventory.find({
        organisation: id,
      })
      .limit(3)
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "recent Invenotry Data",
      inventory,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Recent Inventory API",
      error,
    });
  }
};

// GET DONAR REOCRDS
const getDonarsController = async (req, res) => {
  try {
    const {organisationId} = req.body;
    if(!organisationId){
        return res.status(400).json({
            success: false,
            message:"provide organisationId"
        })
    }
    //find donars
    const donorId = await Inventory.distinct("donar", {
      organisation:new mongoose.Types.ObjectId(organisationId),
    });
    console.log(donorId);
    const donars = await User.find({ _id: { $in: donorId } });

    return res.status(200).send({
      success: true,
      message: "Donar Record Fetched Successfully",
      donars,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Donar records",
      error,
    });
  }
};

const getHospitalController = async (req, res) => {
  try {
    const {organisationId} = req.body;
    if(!organisationId){
        return res.status(400).json({
            success: false,
            message:"provide organisation id man!"
        })
    }
    //GET HOSPITAL ID
    const hospitalId = await Inventory.distinct("hospital", {
      organisation: new mongoose.Types.ObjectId(organisationId),
    });
    //FIND HOSPITAL
    const hospitals = await User.find({
      _id: { $in: hospitalId },
    });
    return res.status(200).send({
      success: true,
      message: "Hospitals Data Fetched Successfully",
      hospitals,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In get Hospital API",
      error,
    });
  }
};

// GET ORG PROFILES
const getOrgnaisationController = async (req, res) => {
  try {
    const {donarId} = req.body;
    if(!donarId){
        return res.status(400).json({
            success: false,
            message:"provide doner id man"
        })
    }
    const orgId = await Inventory.distinct("organisation", { donar:new mongoose.Types.ObjectId(donarId) });
    //above orgId is an array of all organisation where doner donated blood
    //find org
    const organisations = await User.find({
      _id: { $in: orgId },
    });
    return res.status(200).send({
      success: true,
      message: "Org Data Fetched Successfully",
      organisations,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In ORG API",
      error,
    });
  }
};
// GET ORG for Hospital
const getOrgnaisationForHospitalController = async (req, res) => {
  try {
    const {hospitalId} = req.body;
    if(!hospitalId){
        return res.status(400).json({
            success: false,
            message:"provide hospital id"
        })
    }
    const orgId = await Inventory.distinct("organisation", { hospital: new mongoose.Types.ObjectId(hospitalId) });
    //find org
    const organisations = await User.find({
      _id: { $in: orgId },
    });
    return res.status(200).send({
      success: true,
      message: "Hospital Org Data Fetched Successfully",
      organisations,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error In Hospital ORG API",
      error,
    });
  }
};

module.exports = {
  createInventoryController,
  getInventoryController,
  getDonarsController,
  getHospitalController,
  getOrgnaisationController,
  getOrgnaisationForHospitalController,
  getInventoryHospitalController,
  getRecentInventoryController,
};
