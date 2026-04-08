import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { createWasteModel, farmerModel,orderModel } from '../db.js';
import farmerAuth from '../middleware/farmer.js';
const FARMER_SECRET =process.env.FARMER_SECRET||"BiolOOpFarmer"
const farmerRouter = Router()

farmerRouter.post('/signup',async(req,res)=>{
    const {farmerName,farmerEmail,farmerPhone,farmerPassword,farmerStreet,farmerVillage,farmerPincode,farmerBio} =req.body;
    console.log(req.body)
    const farmerExists = await farmerModel.findOne({
        farmerEmail:farmerEmail
    })
    if(farmerExists){
        return res.json({
            message:'Farmer already exists'
        })
    }

    const hashedPass = await bcrypt.hash(farmerPassword,3);

    await farmerModel.create({
        farmerName,
        farmerEmail,
        farmerPassword:hashedPass,
        farmerPhone,
        farmerStreet,
        farmerVillage,
        farmerPincode,
        farmerBio
    })
    res.json({
        message:'registration completed succesfully'
    })
})

farmerRouter.post('/login',async(req,res)=>{
    const {farmerEmail,farmerPassword}=req.body

    const farmerExists = await farmerModel.findOne({
        farmerEmail
    })
    const hashedPass = await bcrypt.compare(farmerPassword,farmerExists.farmerPassword)

    if(farmerExists&&hashedPass){
        const token = jwt.sign({id:farmerExists._id},
            FARMER_SECRET)
        res.json({
            message:'login succesfull',
            token
        })
    }else{
        res.json({
            message:"Invalid crediantials"
        })
    }
})

farmerRouter.use(farmerAuth);
farmerRouter.post('/createWaste',async (req,res)=>{
    const farmerId = req.farmerId;
    const {wasteType,wasteQuantity,wasteDescription,wasteImage} = req.body;

   const waste = await createWasteModel.create({
        wasteType,
        wasteQuantity,
        wasteDescription,
        wasteImage,
        farmer:farmerId
    })
    res.json({
        message:"waste created successfully",
        WasteId: waste._id
    })
})

farmerRouter.get('/wasteList',async (req,res)=>{
    const farmerId = req.farmerId;
    
    const wasteList = await createWasteModel.find({
        farmer: farmerId
    })
    res.json({
        wasteList
    })
})



farmerRouter.get("/orders", async (req, res) => {
  try {
    const farmerId = req.farmerId; 

    if (!farmerId) {
      return res.status(401).json({ message: "Unauthorized: Missing farmer ID" });
    }

    const orders = await orderModel
      .find({ farmerId })
      .populate({
        path: "wasteId",
        select: "wasteType wasteQuantity wasteDescription wasteImage",
      })
      .populate({
        path: "companyId",
        select: "companyName companyEmail companyPhone companyVillage",
      })
      .populate({
        path: "adminId",
        select: "adminName adminEmail",
      })
      .sort({ createdAt: -1 }); 

    if (!orders.length) {
      return res.json({ message: "No orders found for this farmer", orders: [] });
    }

    res.json({
      message: "Orders fetched successfully",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching farmer orders:", error.message);
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
});


farmerRouter.get("/profile",  async (req, res) => {
  try {
    const farmerId = req.farmerId; 
    const farmer = await farmerModel.findById(farmerId).select("-farmerPassword");
    if (!farmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }
    res.json(farmer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching farmer profile", error: error.message });
  }
});

farmerRouter.put("/profile",  async (req, res) => {
  try {
    const farmerId = req.farmerId;
    const updates = req.body;

    delete updates.farmerPassword;

    const updatedFarmer = await farmerModel
      .findByIdAndUpdate(farmerId, updates, { new: true, runValidators: true })
      .select("-farmerPassword");

    if (!updatedFarmer) {
      return res.status(404).json({ message: "Farmer not found" });
    }

    res.json({
      message: "Profile updated successfully",
      farmer: updatedFarmer,
    });
  } catch (error) {
    res.status(400).json({ message: "Error updating profile", error: error.message });
  }
});

export{farmerRouter}