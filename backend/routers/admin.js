import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { adminModel, createWasteModel, orderModel,farmerModel,companyModel } from '../db.js';
import adminAuth from '../middleware/admin.js'; 

const ADMIN_SECRET = process.env.ADMIN_SECRET

const adminRouter = Router();

adminRouter.post('/signup',async(req,res)=>{
    const {adminName,adminEmail,adminPassword,adminAdhar} = req.body;
    
        const adminExists = await adminModel.findOne({
            adminEmail
        })
        if(adminExists){
            return res.json({
                message:'Farmer already exists'
            })
        }
    
        const hashedPass = await bcrypt.hash(adminPassword,10);
    
        await adminModel.create({
   adminName,
   adminEmail,
   adminPassword: hashedPass,
   adminAdhar
})

        res.json({
            message:'registration completed succesfully'
        })
})

adminRouter.post('/login',async(req,res)=>{
    const{adminEmail,adminPassword} = req.body;

    const adminExists = await adminModel.findOne({
        adminEmail
    })

    const hashedPass = bcrypt.compare(adminPassword,adminExists.adminPassword);

    if(adminExists&&hashedPass){
        const token = jwt.sign({id:adminExists._id},
            ADMIN_SECRET);
            res.json({
                message:'login successfull',
                token
            })
    }else{
        res.json({
            message:'invalid crediantials'
        })
    }
})

adminRouter.use(adminAuth);

adminRouter.get("/acceptedWastes", async (req, res) => {
  try {
    const existingOrders = await orderModel.find().select("wasteId");
    const orderedWasteIds = existingOrders.map((o) => o.wasteId.toString());

    const wastes = await createWasteModel
      .find({
        isAllocated: true,
        isAccepted: false, 
        _id: { $nin: orderedWasteIds }, 
      })
      .populate("farmer")
      .populate("companyId");

    res.json(wastes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.post("/createOrder/:wasteId", async (req, res) => {
  try {
    const { price } = req.body;
    const { wasteId } = req.params;
    const adminId = req.adminId; 


    const waste = await createWasteModel.findById(wasteId);
    if (!waste) {
      return res.status(404).json({ message: "Waste not found" });
    }

    const existingOrder = await orderModel.findOne({ wasteId });
    if (existingOrder) {
      return res
        .status(400)
        .json({ message: "Order already exists for this waste" });
    }


    const order = await orderModel.create({
      wasteId,
      farmerId: waste.farmer,
      companyId: waste.companyId || null,
      adminId,
      price,
    });

    waste.isAccepted = true;
    await waste.save();

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


adminRouter.put("/updateOrder/:orderId", async (req, res) => {
  try {
    const { price, orderStatus, paymentStatus } = req.body;

    const updatedOrder = await orderModel.findByIdAndUpdate(
      req.params.orderId,
      {
        ...(price !== undefined && { price }),
        ...(orderStatus && { orderStatus }),
        ...(paymentStatus && { paymentStatus }),
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      message: "Order updated successfully",
      updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


adminRouter.get("/allOrders", async (req, res) => {
  try {
    const orders = await orderModel
      .find()
      .populate("wasteId")
      .populate("farmerId")
      .populate("companyId")
      .populate("adminId");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


adminRouter.get("/myOrders", async (req, res) => {
  try {
    const adminId = req.adminId;
    const orders = await orderModel
      .find({ adminId })
      .populate("wasteId")
      .populate("farmerId")
      .populate("companyId");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.get("/allWastes", async (req, res) => {
  try {
    const wastes = await createWasteModel.find()
      .populate("farmer")
      .populate("companyId");
    res.json(wastes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


adminRouter.get("/allCompanies", async (req, res) => {
  try {
    const companies = await companyModel.find();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.get("/allFarmers", async (req, res) => {
  try {
    const farmers = await farmerModel.find();
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
export { adminRouter };