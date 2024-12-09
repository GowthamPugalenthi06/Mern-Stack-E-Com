import { Order } from "../modules/Order.js";
import { Product } from "../modules/Product.js";
//create new order
export const newOrder = async (req, res) => {
    try {

        const order = new Order({
            ...req.body, // Spread the incoming order data
            user: req.user._id, // Assign the user's ID from the auth middleware
        });
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};





//get single order
export const getSingleOrder = async (req,res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId).populate("user","name email")
        if(!order){
            return res.status(404).json({message:"Order not found",success:false})
            }
        res.status(200).json({order,success:true})
    }catch(error){
        res.status(500).json({message:error.message})
    }
}

//get Logged in user order
export const myOrder = async (req, res) => {
    try {
        // Log the user ID to debug
        console.log("Logged-in User ID:", req.user.id);

        // Find orders for the logged-in user
        const orders = await Order.find({ user: req.user.id });

        // Log the retrieved orders
        console.log("Retrieved Orders:", orders);

        // Respond with the user's orders
        res.status(200).json({
            orders,
            success: true
        });
    } catch (error) {
        // Log the error and respond with a 500 status
        console.error("Error in myOrder:", error);
        res.status(500).json({ message: error.message });
    }
};


//Admin: Get All Order
export const orders = async(req,res)=>{
    try {
        if(req.user.role!="admin"){
            return res.status(403).json({message:"You are not authorized to perform this action"})
        }
        const orders = await Order.find();
        let totalAmount = 0;
        orders.forEach(order => {
            totalAmount += order.totalPrice
        })

        res.status(200).json({
            orders,success:true,totalAmount
        })
    }catch(error){
        res.status(500).json({message:error.message})
    }
}
//Update order
export const updateOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if(order.orderStatus=='Delivered'){
            return res.status(400).json({message:"Order has been already delivered"})
        }
        // updating the product stock o each order item
        order.orderItems.forEach(async orderItem => {
            await updateStock(orderItem.product,orderItem.quantity)
        })
        order.orderStatus = req.body.orderStatus;
        order.updatedAt = Date.now();
        await order.save();
        res.status(200).json({
            success:true
        })
    }catch(error){
        res.status(500).json({message:error.message})
    }
}
async function updateStock(productId,quantity){
    const product = await Product.findById(productId);
    product.stock = product.stock - quantity;
    await product.save({validateBeforeSave:false});
}
//Admin : Delete order
export const deleteOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if(!order){
            return res.status(404).json({message:"Order not found",success:false})
        }
        await order.deleteOne();
        res.status(200).json({
            success:true
        })
    }catch(error){
        res.status(500).json({message:error.message})
    }
}