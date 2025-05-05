import Product from "../models/product.js"
import { isAdmin } from "./userController.js"

export function saveProducts(req, res) {
    if (!isAdmin(req)) {
        res.status(403).json({
            message : "Your not autherized to add a products"
        })
        return
    }

    const product = new Product(
        req.body
    )

    product.save().then(() => {
        res.json({
            message : "Product add successfully"
        })
    }).catch(() => {
        res.json({
            message : "Product add failed"
        })
    })
}

export async function getProducts(req, res) {
    try{
        if(isAdmin(req)){
            const products = await Product.find()
            res.json(products)
        } else {
            const products = await Product.find({isAvailable : true})
        res.json(products)
        }
        
    } catch(err) {
        res.json({
            message : "Failed to get products",
            error : err
        })
    }
}

export async function deleteProducts(req, res) {
    if (!isAdmin(req)) {
        res.json({
            message : "Your not authorized to delet products"
        })
        return
    }

    try{
        await Product.deleteOne({productId : req.params.productId})

        res.json({
            message : "Product delete successfully."
        })
    } catch(err) {
        res.json({
            message : "Faild to delete product",
            error : err
        })
    }
}

export async function updateProducts(req, res) {
    if (!isAdmin(req)) {
        res.json({
            message : "Your not authorized to update that product"
        })
        return
    }

    const productId = req.params.productId
    const updatingData = req.body

    try{
        await Product.updateOne({productId : productId}, updatingData)

        res.json({
            message : "Product updated successfully",
        })
    } catch(err) {
        res.status(500).json({
            message : "Internal server error",
            error : err
        })
        return
    }
}

export async function getProductsById(req, res) {
    const productId = req.params.productId
    
    try{
        const product = await Product.findOne({productId : productId})

        if (product == null) {
            res.status(404).json({
                message : "Product not found"
            })
            return
        }

        if (product.isAvailable) {
            res.json(product)
        } else {
            if (!isAdmin(req)) {
                res.status(404).json({
                    message : "Product not found"
                })
                return
            } else {
                res.json(product)
            }
        }
    } catch(err) {

    }
}