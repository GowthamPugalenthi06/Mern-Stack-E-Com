import express from 'express';
import dotenv from "dotenv";
import connectDB from './database/db.js';
import userRouter from "./routes/User.js";
import productRouter from "./routes/Product.js";
import orderRouter from "./routes/Order.js";
import path from 'path'
import { fileURLToPath } from 'url';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import payRouter from './routes/Payment.js';

dotenv.config();
const app = express();
const port = process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json())
app.use("/uploads",express.static("uploads"))
app.use("/uploads",express.static(path.join(__dirname,'uploads')))
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true, 
    allowedHeaders: ['Content-Type', 'Authorization'],
    
}));
app.use(cookieParser());
app.use("/api/", userRouter);
app.use("/api/", productRouter);

app.use("/api/", orderRouter);
app.use("/api/", payRouter);
if(process.env.NODE_ENV==='production'){
    app.use(express.static(path.join(__dirname,'../frontend/build')));
    app.get('*',(req,res)=>{
        res.sendFile(path.resolve(__dirname,'../frontend/build/index.html'))
    })
}
app.get("/", (req, res) => {
    console.log(req);
    return res.status(234);
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
    connectDB();
});