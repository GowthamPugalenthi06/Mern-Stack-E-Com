import express from "express";
import { uploadFiles } from "../middleware/multer.js";
import { createProduct, deleteProduct,deleteReview,getReview,createReview, fetchAllProduct, getProduct, singleProduct, updateStack, getAdminProducts, updateProduct } from "../controller/product.js";
import { isAuth } from "../middleware/isAuth.js";

const productRouter = express.Router();
productRouter.get('/product',getProduct);
productRouter.post('/product/new',isAuth,uploadFiles,createProduct);
productRouter.get('/product/all-product',fetchAllProduct)
productRouter.get('/product/single/:id',singleProduct)
productRouter.delete('/product/:id',isAuth,deleteProduct)
productRouter.put('/product/:id',isAuth,updateStack)

//admin
productRouter.get('/admin/products',isAuth,getAdminProducts);
productRouter.put('/admin/product/:id',isAuth,uploadFiles,updateProduct);
productRouter.put('/review',isAuth,createReview)
productRouter.get('/admin/reviews',isAuth,getReview)
productRouter.delete('/admin/review',isAuth,deleteReview)
export default productRouter;