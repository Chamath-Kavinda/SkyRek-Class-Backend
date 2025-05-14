import express from 'express';
import { createUser, getUser, loginUser } from '../controllers/userController.js';

const userRouter = express.Router()

userRouter.post("/signup", createUser)
userRouter.get("/", getUser)
userRouter.post("/login", loginUser)

export default userRouter;