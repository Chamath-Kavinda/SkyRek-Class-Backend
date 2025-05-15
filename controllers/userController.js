import User from "../models/user.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export function createUser(req, res) {
    if (req.body.role == "admin") {
        if (req.user != null) {
            if (req.user.role != "admin") {
                res.status(403).json({
                    message : "Your not authorized to create admin accounts."
                })
                return
            }
        } else {
            res.status(403).json({
                message : "Your not authorized to create admin account. Please login first"
            })
            return
        }
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10)

    const user = new User({
        image: req.body.image,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email,
        password : hashedPassword,
    });

    user.save().then(() => {
        res.json({
            message : "User save successfully"
        })
    }).catch(() => {
        res.json({
            message : "User save failed"
        })
    })
}

export function getUser(req, res) {
    User.find().then((data) => {
        res.json(data)
    })
}

export function loginUser(req, res) {
    const email = req.body.email
    const password = req.body.password

    User.findOne({email : email}).then((user) => {
        if (user == null){
            res.status(404).json({
                "message" : "User not found"
            })
        } else {
            const isPasswordCorrect = bcrypt.compareSync(password, user.password)

            const token = jwt.sign({
                email : user.email,
                firstName : user.firstName,
                lastName : user.lastName,
                role : user.role,
                image : user.image
            }, process.env.JWT_KEY)


            if (isPasswordCorrect) {

                res.status(200).json({
                    message : "Login successfull",
                    token : token,
                    role : user.role
                })
            } else {
                res.status(404).json({
                    "message" : "wrong password"
                })
            }

        }
    })
}

export function isAdmin(req) {
    if (req.user == null) {
        return false
    }
    if (req.user.role != "admin") {
        return false
    }
    return true
}