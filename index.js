import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import productRouter from './routes/productRouter.js';
import userRouter from './routes/userRouter.js'; 
import jwt from 'jsonwebtoken';
import orderRouter from './routes/orderRouter.js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const port = 3000;

app.use(cors())
app.use(bodyParser.json())
app.use((req, res, next) => {
    const tokenString = req.header("Authorization")

    if(tokenString != null) {
        const token = tokenString.replace("Bearer ", "")   

        jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if(decoded != null){
                req.user = decoded
                next()
            } else {
                res.status(403).json({
                    message : "Unautherized person invalied token"
                })
            }
        })
    } else {
        next()
    }
})

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Connected to the Database!")
}).catch(() => {
    console.log("Database onnection Failed!")
})



app.use("/api/products", productRouter)
app.use("/api/users", userRouter)
app.use("/api/orders", orderRouter)



app.listen(port, () => {
    console.log("Server is runing on port " + port);
})