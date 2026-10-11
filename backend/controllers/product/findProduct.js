import productModel from "../../models/productModel.js";
import mongoose from "mongoose";

const findProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(404).send({
                success: false,
                errorType: "productNotFound",
                message: "Product Not Found",
            });
        }

        const response = await productModel.findById(productId);
        if (!response) {
            return res.status(404).send({
                success: false,
                errorType: "productNotFound",
                message: "Product Not Found",
            });
        }

        return res.status(201).send({
            success: true,
            message: "Product Fetched Successfully",
            product: response,
        });
    } catch (error) {
        console.log("Find Product Error: " + error);
        res.status(500).send({
            success: false,
            message: "Error in Finding Product",
            error,
        });
    }
};
export default findProduct;
