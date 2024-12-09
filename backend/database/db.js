import mongoose from "mongoose";

const connectDB = async () => {
    try{
        await mongoose
        .connect(process.env.DB)
        .then(()=>{
            console.log("connected to database");
        })
        .catch((error)=>{
            console.log(error)
        })
    }
    catch{
        console.log("Error connecting to database");
    }
}
export default connectDB;