import { Product } from "../modules/Product.js";
import { User } from "../modules/User.js";
import mongoose from "mongoose";
import { rm } from "fs";
import ErrorHandler from "../utils/error.js";
import APIFeatures from "../utils/apiFeatures.js";
import { resolve } from "path";
import fs from "fs";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); // Get the file's path
const __dirname = dirname(__filename); // Get the directory name from the file path

export const createProduct = async (req, res) => {
  try {
    if (req.user.role != "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    const { title, price, description, category, stock } = req.body;
    const images = req.files;
    if (!images || images.length < 2) {
      return res.status(400).json({ message: "Please upload two images" });
    }

    const product = await Product.create({
      title,
      description,
      category,
      price,
      stock,
      images: images.map((img) => img.path),
    });

    res.status(201).json({
      message: "Product is successfully created",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Fetch All product
export const fetchAllProduct = async (req, res) => {
  try {
    const product = await Product.find();
    return res.status(200).json({ message: "list of Products", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//single product
export const singleProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return res.status(201).json({ message: "Product Details", product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//delete
export const deleteProduct = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }

    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if there is an image to delete
    if (product.images && product.images.length > 0) {
      product.images.forEach((image) => {
        // Ensure the image path is correct
        const imagePath = path.join(__dirname, "..", "uploads", image); // Adjust based on where your images are stored

        // Check if file exists and delete it
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error(`Error deleting image: ${imagePath}`);
          } else {
            console.log(`Image deleted: ${imagePath}`);
          }
        });
      });
    }

    // Delete the product from the database
    await product.deleteOne();

    return res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: error.message });
  }
};
//update stack details
export const updateStack = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (req.user.role != "admin") {
      return res
        .status(403)
        .json({ message: "You are not authorized to perform this action" });
    }
    if (!product) {
      return res.status(403).json({ message: "Invalid Product Details" });
    }
    if (req.body.stock) {
      product.stock = req.body.stock;
      await product.save();
      return res.json({ message: "Stock updated" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Get product
export const getProduct = async (req, res) => {
  try {
    const resPerPage = 3;
    let buildQuery = () => {
      return new APIFeatures(Product.find(), req.query).search().filter();
    };
    const filterProductsCount = await buildQuery().query.countDocuments({});
    const totalProductsCount = await Product.countDocuments({});
    let productsCount = totalProductsCount;
    if (filterProductsCount !== productsCount) {
      productsCount = filterProductsCount;
    }
    const product = await buildQuery().paginate(resPerPage).query;

    return res
      .status(200)
      .json({
        message: "Product Details",
        count: productsCount,
        product,
        success: true,
        resPerPage,
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//update Product
export const updateProduct = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "You are not authorized to perform this action" });
    }

    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let images = [];
    // If imagesCleared is false, keep existing images
    if (req.body.imagesCleared === "false") {
      images = product.images;  // Preserve the old images
    }

    // If new images are uploaded, process them
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const filePath = `/uploads/product/${file.filename}`; // Use correct relative path
        images.push({ image: filePath });  // Store image path
      });
    }

    // Assign updated images to the body
    req.body.images = images;

    // Update the product in the database
    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};


//Create Review
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const review = {
      rating: rating,
      comment: comment,
    };
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // Checking if user has already reviewed
    const isReviewed = product.review.find(
      (review) => review.user.toString() === req.user.id.toString()
    );
    if (isReviewed) {
      // Update the existing review
      product.review.forEach((review) => {
        if (review.user.toString() === req.user.id.toString()) {
          review.rating = rating;
          review.comment = comment; // Corrected typo
        }
      });
    } else {
      // Create new review
      product.review.push(review);
      product.numOfReview = product.review.length;
    }
    // Calculate average rating
    product.rating =
      product.review.reduce((acc, review) => acc + review.rating, 0) /
      product.review.length;
    product.rating = isNaN(product.rating) ? 0 : product.rating; // Ensure NaN check
    await product.save({ validateBeforeSave: false });
    res.status(200).json({ message: "Review Added", success: true });
  } catch (error) {
    console.error(error); // Added logging for better visibility
    res.status(500).json({ message: error.message });
  }
};

// Get review
export const getReview = async (req, res) => {
  try {
    const product = await Product.findById(req.query.id).populate(
        {
            path: 'review.user',
            select: 'name email',
            options: { strictPopulate: false }
          }
      
     
    );
    console.log(product.review.user)

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ review: product.review, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//Delete review
export const deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.query.productId);
    //filtering the reviews does not match deleting review id
    const reviews = product.review.filter((review) => {
      review._id.toString() !== req.query.id.toString();
    });
    // number of reviews
    const numOfReview = reviews.length;
    // finding the average for rating
    let ratings =
      product.review.reduce((acc, review) => {
        return (acc += review.rating);
      }, 0) / product.review.length;
    ratings = isNaN(ratings) ? 0 : ratings;
    //update the product
    await Product.findByIdAndUpdate(req.query.productId, {
      review: reviews,
      numOfReview: numOfReview,
      ratings: ratings,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// export const createProduct = async (req, res) => {
//     try {
//         if (req.user.role !== "admin") {
//             return res.status(403).json({ message: "You are not authorized to perform this action" });
//         }

//         let images = [];
//         let BASE_URL = process.env.BACKEND_URL;
//         if (process.env.NODE_ENV === "production") {
//             BASE_URL = `${req.protocol}://${req.get('host')}`;
//         }

//         if (req.files && req.files.length > 0) {
//             req.files.forEach(file => {
//                 let url = `${BASE_URL}/uploads/product/${file.originalname}`;
//                 images.push({ image: url });
//             });
//         }

//         const { title, price, description, category, stock } = req.body;

//         const product = await Product.create({
//             title,
//             description,
//             category,
//             price,
//             stock,
//             images: images.map(img => img.image), // Use image URLs collected
//             user: req.user.id
//         });

//         res.status(201).json({
//             success: true,
//             product,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

//get admin products
export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.status(200).send({
      products,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
