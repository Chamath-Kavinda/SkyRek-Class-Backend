import express from 'express';
import { checkAdmin, createUser, getUser, loginUser, loginWithGoogle, resetPassword, sendOTP } from '../controllers/userController.js';

const userRouter = express.Router()

userRouter.post("/signup", createUser)
userRouter.get("/", getUser)
userRouter.post("/login", loginUser)
userRouter.post("/login/google", loginWithGoogle)
userRouter.post("/send-otp", sendOTP)
userRouter.post("/reset-password", resetPassword)
userRouter.get("/check-admin", checkAdmin)

export default userRouter;