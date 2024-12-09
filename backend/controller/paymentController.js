import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();
console.log(process.env.STRIPE_SECRET_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const processPayment = async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: req.body.amount,
            currency: "usd",
            description: "TEST PAYMENT",
            metadata: { integration_check: "accept_payment" },
            shipping: req.body.shipping,
        });

        res.status(200).json({
            success: true,
            client_secret: paymentIntent.client_secret,
        });
        
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const sendStripeApi = async (req, res) => {
    try {
        res.status(200).json({
            stripeApiKey: process.env.STRIPE_API_KEY,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
