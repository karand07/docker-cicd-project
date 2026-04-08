import 'dotenv/config';
import express from 'express';
const app = express();
const port = 3000;
import mongoose from 'mongoose';
import {farmerRouter} from './routers/farmer.js'
import {companyRouter} from './routers/company.js'
import { adminRouter } from './routers/admin.js';
import cors from 'cors';
const MONGO_URL = process.env.MONGO_URL || "mongodb://172.17.0.1:27017/bioloop"
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use('/farmer',farmerRouter);
app.use('/company',companyRouter);
app.use('/admin',adminRouter)

async function main(){
await mongoose.connect(MONGO_URL)
    app.listen(3000,()=>console.log(`server is running on the port ${port}`))
}
main();