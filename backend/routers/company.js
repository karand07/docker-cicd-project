import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import { companyModel, createWasteModel,orderModel , farmerModel } from '../db.js';
import companyAuth from '../middleware/company.js'
const COMPANY_SECRET= process.env.COMPANY_SECRET
const companyRouter = Router();

companyRouter.post('/signup',async(req,res)=>{
    const{companyName,companyEmail,companyPhone,companyPassword,companyStreet,companyVillage,companyPincode,companyBio} = req.body ;
    const companyExists = await companyModel.findOne({
        companyEmail:companyEmail
    });
    if(companyExists){
        return res.json('company Already Exists');
    }
    const hashedPass = await bcrypt.hash(companyPassword,3);
        await companyModel.create({
            companyName:companyName,
            companyEmail:companyEmail,
            companyPhone:companyPhone,
            companyPassword:hashedPass,
            companyStreet:companyStreet,
            companyVillage:companyVillage,
            companyPincode:companyPincode,
            companyBio:companyBio
        });
        res.json({
            messagage:'Company registered Succcessfully'
        })
})

companyRouter.post('/login',async(req,res)=>{
    const {companyEmail,companyPassword} = req.body

    const company = await companyModel.findOne({
        companyEmail:companyEmail
    });
    const hashedPass = await bcrypt.compare(companyPassword,company.companyPassword)
    if(company&& hashedPass){
        const token = jwt.sign({
            id: company._id
        },COMPANY_SECRET)
        res.json({
            messagage:'login succesfull',
            token:token
        })
    }else{
        res.json({
            messagage:'Enter correct Crediantials '
        })
    }
})

companyRouter.use(companyAuth);

companyRouter.get('/wasteList',async (req,res)=>{
 const wasteList = await  createWasteModel.find({isAllocated:false})
res.json({
    wasteList
})
})

companyRouter.put('/acceptWaste/:id', async (req, res) => {
  const companyId = req.companyId;

  try {
    const waste = await createWasteModel.findByIdAndUpdate(
      req.params.id,
      { isAllocated: true, companyId },
      { new: true }
    );

    if (!waste) return res.status(404).json({ message: 'Waste not found' });

    res.json({ message: 'Waste allocated successfully', waste });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

companyRouter.get('/allocatedWasteList',async (req,res)=>{
    const companyId = req.companyId;
    const allocatedWasteList = await createWasteModel.find({companyId,isAllocated:true})

    if(!allocatedWasteList){
        return res.json({
            messagage:"no waste allocated found"
        })
    }

    res.json({
        allocatedWasteList
    })
})

companyRouter.get("/orders", async (req, res) => {
  try {
    const companyId = req.companyId; 
    const orders = await orderModel.find({ companyId })
      .populate("wasteId")
      .populate("farmerId")
      .populate("adminId");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
companyRouter.get("/profile",    async (req, res) => {
  try {
    const companyId = req.companyId; 

    const company = await companyModel
      .findById(companyId)
      .select("-companyPassword");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);
  } catch (error) {
    console.error("Error fetching company profile:", error.message);
    res.status(500).json({
      message: "Error fetching company profile",
      error: error.message,
    });
  }
});


companyRouter.put("/profile",  async (req, res) => {
  try {
    const companyId = req.companyId;
    const updates = req.body;

    delete updates.companyPassword;

    const updatedCompany = await companyModel
      .findByIdAndUpdate(companyId, updates, {
        new: true,
        runValidators: true,
      })
      .select("-companyPassword");

    if (!updatedCompany) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({
      message: "Profile updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating company profile:", error.message);
    res.status(400).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
});
export{companyRouter}