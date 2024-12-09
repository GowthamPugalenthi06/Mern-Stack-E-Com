import express from "express";
import { newOrder,getSingleOrder,updateOrder, myOrder,orders, deleteOrder} from "../controller/order.js";
import { isAuth } from "../middleware/isAuth.js";


const orderRouter = express.Router();
orderRouter.post('/order/new',isAuth,newOrder);
orderRouter.get('/order/:id',isAuth,getSingleOrder);
orderRouter.get('/my-orders',isAuth,myOrder);

//Admin routes
orderRouter.get('/admin/orders',isAuth,orders);
orderRouter.put('/admin/orders/:id',isAuth,updateOrder);
orderRouter.delete('/admin/orders/:id',isAuth,deleteOrder);

export default orderRouter;