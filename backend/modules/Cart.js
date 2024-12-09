import mongoose from "mongoose";


const schema = new mongoose.Schema({
    Product :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    }

})
export const Cart = mongoose.model('Cart', schema);