import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import productRouter from './routes/productRouter.js';
import userRouter from './routes/userRouter.js'; 
import jwt from 'jsonwebtoken';
import orderRouter from './routes/orderRouter.js';

const app = express();
const port = 3000;

app.use(bodyParser.json())
app.use((req, res, next) => {
    const tokenString = req.header("Authorization")

    if(tokenString != null) {
        const token = tokenString.replace("Bearer ", "")   

        jwt.verify(token, "SKYREK-CLASS", (err, decoded) => {
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

mongoose.connect("mongodb+srv://chamath:Chamath13243546@cluster.ru1f3di.mongodb.net/?retryWrites=true&w=majority&appName=Cluster").then(() => {
    console.log("Connected to the Database!")
}).catch(() => {
    console.log("Database onnection Failed!")
})



app.use("/products", productRouter)
app.use("/users", userRouter)
app.use("/orders", orderRouter)



app.listen(port, () => {
    console.log("Server is runing on port " + port);
})