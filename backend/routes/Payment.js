import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { processPayment, sendStripeApi } from "../controller/paymentController.js";

const payRouter = express.Router();
payRouter.post('/payment/process',isAuth,processPayment);
payRouter.get('/stripeapi',isAuth,sendStripeApi);


export default payRouter;