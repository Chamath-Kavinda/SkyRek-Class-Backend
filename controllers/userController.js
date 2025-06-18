import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";

dotenv.config();

export function createUser(req, res) {
  if (req.body.role == "admin") {
    if (req.user != null) {
      if (req.user.role != "admin") {
        res.status(403).json({
          message: "Your not authorized to create admin accounts.",
        });
        return;
      }
    } else {
      res.status(403).json({
        message:
          "Your not authorized to create admin account. Please login first",
      });
      return;
    }
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  const user = new User({
    image: req.body.image,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashedPassword,
  });

  user
    .save()
    .then(() => {
      res.json({
        message: "User save successfully",
      });
    })
    .catch(() => {
      res.json({
        message: "User save failed",
      });
    });
}

export function getUser(req, res) {
  User.find().then((data) => {
    res.json(data);
  });
}

export function loginUser(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }).then((user) => {
    if (user == null) {
      res.status(404).json({
        message: "User not found",
      });
    } else {
      const isPasswordCorrect = bcrypt.compareSync(password, user.password);

      const token = jwt.sign(
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          image: user.image,
        },
        process.env.JWT_KEY
      );

      if (isPasswordCorrect) {
        res.status(200).json({
          message: "Login successfull",
          token: token,
          role: user.role,
        });
      } else {
        res.status(404).json({
          message: "wrong password",
        });
      }
    }
  });
}

export async function loginWithGoogle(req, res) {
  const token = req.body.accessToken;
  if (token == null) {
    res.status(400).json({
      message: "Access token is required",
    });
    return;
  }

  const response = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const user = await User.findOne({
    email: response.data.email,
  });

  if (user == null) {
    const newUser = new User({
      email: response.data.email,
      firstName: response.data.given_name,
      lastName: response.data.family_name,
      password: "googleUser",
      image: response.data.picture,
    });

    await newUser.save();
    const token = jwt.sign(
      {
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        image: newUser.image,
      },
      process.env.JWT_KEY
    );

    res.json({
      message: "Login successful",
      token: token,
      role: newUser.role,
    });
  } else {
    const token = jwt.sign(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        image: user.image,
      },
      process.env.JWT_KEY
    );

    res.json({
      message: "Login successful",
      token: token,
      role: user.role,
    });
  }
}

const transport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "chamakavi4@gmail.com",
    pass: "hmsrvfzqsghshqiz",
  },
});

export async function sendOTP(req, res) {
  const randomOTP = Math.floor(100000 + Math.random() * 900000);
  const email = req.body.email;
  if (email == null) {
    res.status(400).json({
      message: "Email is required",
    });
    return;
  }

  const user = await User.findOne({
    email: email,
  });

  if (user == null) {
    res.status(404).json({
      message: "User not found",
    });
    return;
  }

  //delete all otps
  await OTP.deleteMany({
    email: email,
  });

  const message = {
    from: "chamakavi4@gmail.com",
    to: email,
    subject: "Resetting password for Chama Clothes",
    text: "This is your password reset OTP : " + randomOTP,
  };

  const otp = new OTP({
    email: email,
    otp: randomOTP,
  });

  await otp.save();

  transport.sendMail(message, (error, indor) => {
    if (error) {
      res.status(500).json({
        message: "Failed to send OTP",
        error: error,
      });
    } else {
      res.status(200).json({
        message: "OTP sent successfully",
        otp: randomOTP,
      });
    }
  });
}

export async function resetPassword(req, res) {
  const otp = req.body.otp;
  const email = req.body.email;
  const newPassword = req.body.newPassword;

  const response = await OTP.findOne({
    email: email,
  });

  if (response == null) {
    res.status(500).json({
      message: "No otp requests found please try again",
    });
    return;
  }

  if (otp == response.otp) {
    await OTP.deleteMany({
      email: email,
    });

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    const response2 = await User.updateOne(
      { email: email },
      { password: hashedPassword }
    );

    res.json({
      message: "password has been reset successfully",
    });
  } else {
    res.status(403).json({
      message: "OPTs are not matching",
    });
    return;
  }
}

export function checkAdmin(req, res) {

  if (isAdmin(req)) {
    res.status(200).json({
      message: "Your Admin",
      role: "admin"
    });
  } else {
    res.status(200).json({
      message: "Your Not Admin",
      role: "customer"
    });
  }
}

export function isAdmin(req) {
  if (req.user == null) {
    return false;
  }
  if (req.user.role != "admin") {
    return false;
  }
  return true;
}
