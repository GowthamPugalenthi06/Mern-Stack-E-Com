import mongoose from "mongoose";

const schema = new mongoose.Schema ({
    title:{
        type:String,
        required:[true,"please enter product name "],
        trim:true,
        maxLength:[100,"Product name cannot exceed 100 characters"]

    },
    description:{
        type:String,
        required:[true,"please enter product description "]

    },
    stock : {
        type:Number,
        required:true
    },
    ratings:{
        type:String,
        default:0
    },
    price:{
        type:Number,
        required:true
    },
    images: [{ type: String, required: true }],
    stock : {
        type:Number,
        default:0
    },
    category:{
        type:String,
        required:[true,"please enter product category "],
        enum:{
            values:[ 'Electronics',
                'Mobile Phones',
                'Laptops',
                'Accessories',
                'Headphones',
                'Food',
                'Books',
                'Clothes/Shoes',
                'Beauty/Health',
                'Sports',
                'Outdoor',
                'Home'],message:"Please select correct category"
        }
    },
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    numOfReview:{
        type:Number,
        default:0.0
    },
    review:[
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User', 
                required: true
              },
            
            rating:{
                type:Number,
                required:true

            },
            comment:{
                type:String,
                required:true
            }
        }
    ]
    
})
export const Product = mongoose.model("product",schema);