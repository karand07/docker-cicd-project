import mongoose, { Schema } from "mongoose";
const ObjectId = mongoose.Types.ObjectId


const farmerSchema = new Schema({
    farmerName: {
      type: String,
      required: true,
      trim: true,
    },
    farmerEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    farmerPhone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    farmerPassword: {
      type: String,
      required: true,
      minlength: 6,
    },
    farmerStreet: {
      type: String,
      required: true,
      trim: true,
    },
    farmerVillage: {
      type: String,
      required: true,
      trim: true,
    },
    farmerPincode: {
      type: String,
      required: true,
      trim: true,
    },
    farmerBio: {
      type: String,
      trim: true,
      default: "",
    }
})

const companySchema = new Schema({
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    companyEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    companyPhone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    companyPassword: {
      type: String,
      required: true,
      minlength: 6,
    },
    companyStreet: {
      type: String,
      required: true,
      trim: true,
    },
    companyVillage: {
      type: String,
      required: true,
      trim: true,
    },
    companyPincode: {
      type: String,
      required: true,
      trim: true,
    },
    companyBio: {
      type: String,
      trim: true,
      default: "",
    }
})

const createWasteSchema = new Schema({
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "farmer", 
      required: true,
    },
    companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'company'
  },
    wasteType: {
      type: String,
      required: true,
      enum: ["Crop Waste", "Animal Waste", "Chemical Waste", "Domestic and Miscellaneous Farm Waste", "Other"],
      default: "Other",
    },
    wasteQuantity: {
      type: Number,
      required: true,
      min: 1,
    },
    wasteDescription: {
      type: String,
      trim: true,
    },
    wasteImage: {
      type: String, 
      default: "",
    },
     isAllocated: {
    type: Boolean,
    default: false
  },
  isAccepted: {         
    type: Boolean,
    default: false
  }
})

const adminSchema = new Schema({
  adminName:{
    type: String,
      required: true,
      trim: true,
  },
  adminEmail: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    adminPassword:{
      type: String,
      required: true,
      minlength: 6,
    },
    adminAdhar:{
      type:String,
      required:true,
    }
})

const orderSchema = new Schema({
  wasteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "createWaste",
    required: true,
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "farmer",
    required: true,
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "company",
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "admin",
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  orderStatus: {
    type: String,
    enum: ["Pending", "Approved", "In Progress", "Completed", "Cancelled"],
    default: "Pending",
  },
  paymentStatus: {
    type: String,
    enum: ["Unpaid", "Paid"],
    default: "Unpaid",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const farmerModel = mongoose.model('farmer',farmerSchema)
export const companyModel= mongoose.model('company',companySchema)
export const createWasteModel = mongoose.model('createWaste',createWasteSchema)
export const adminModel = mongoose.model('admin',adminSchema)
export const orderModel = mongoose.model('order',orderSchema)