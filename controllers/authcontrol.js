const Joi = require("joi");
const HttpStatus = require("http-status-codes");
const User = require("../models/user");
const Token = require('../models/token'); 
const dbConfig = require("../config/secret");
const bcrypt = require("bcryptjs");
const { google, GoogleAuth } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
// the nodemailer transporter config
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: "mihabappual@gmail.com",
    pass: "swjllaetyisfyahc",
  },
});
module.exports = {
  async CreateUser(req, res) {
    // if (!req.body.google_credentials || !req.body.google_credentials.id_token) {
    //   return res.status(HttpStatus.StatusCodes.BAD_REQUEST).json({ message: 'invalid google_credentials' });
    //  }
    //console.log(req.body.google_credentials)

    if (req.body.google_credentials) {
      const client = new OAuth2Client();
      const ticket = await client.verifyIdToken({
        idToken: req.body.google_credentials.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const email = payload["email"];
      const name = payload["given_name"];

      //console.log(payload)
      // Check if the user already exists in the database
      const existingUser = await User.findOne({ email: email });
      if (existingUser) {
        res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Google account already in use" });
        return;
      }
      // Generate a verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000);
      console.log(verificationCode);
      // Create user with Google credentials
      const user = await User.create({
        username: name,
        email: email,
        isVerified: false,
        verificationCode: verificationCode,
      });

      const token = jwt.sign(
        { _id: user._id, username: user.username },
        dbConfig.secret,
        {
          expiresIn: "5h",
        }
      );
      res.cookie("auth", token);
      const tokenData = new Token({ token, userId: user._id });
      console.log(tokenData)
      await tokenData.save();

      // Send verification email
      const verificationLink = `http://localhost:3000/api/mihab/verify?email=${req.body.email}&code=${verificationCode}`;
      const mailOptions = {
        from: "mihabappual@gmail.com",
        to: req.body.email,
        subject: "Please verify your email address",
        html: `<p>Dear ${req.body.username},</p><p>Please click on the following link to verify your email address:</p><p><a href="${verificationLink}">${verificationLink}</a></p><p>Thanks,</p><p>Your App Team</p>`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("Verification email sent: " + info.response);
        }
      });

      return res
        .status(HttpStatus.StatusCodes.CREATED)
        .json({ message: "user created successful", user, token });
    }
    //console.log(req.body)

    const userEmail = await User.findOne({ username: req.body.email });
    if (userEmail) {
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: " email exist " });
      return;
    }
    const userName = await User.findOne({ username: req.body.username });
    if (userName) {
      res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: " username exist " });
      return;
    }
    if (!req.body.acceptTerms) {
      res
        .status(HttpStatus.StatusCodes.BAD_REQUEST)
        .json({ message: "Please accept the terms and conditions" });
      return;
    }
    return bcrypt.hash(req.body.password, 10, (err, hash) => {
      if (err) {
        res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: " hash error " });
        return;
      }
      // Generate a verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000);
      //console.log(verificationCode)

      const newuser = {
        username: req.body.username,
        email: req.body.email,
        password: hash,
        phoneNumber: req.body.phoneNumber,
        isVerified: false,
        verificationCode: verificationCode,
      };
      // Send verification email
      const verificationLink = `http://localhost:3000/api/mihab/verify?email=${req.body.email}&code=${verificationCode}`;
      //console.log(verificationLink)
      const mailOptions = {
        from: "mihabappual@gmail.com",
        to: req.body.email,
        subject: "Please verify your email address",
        html: `<p>Dear ${req.body.username},</p><p>Please click on the following link to verify your email address:</p><p><a href="${verificationLink}">${verificationLink}</a></p><p>Thanks,</p><p>Your App Team</p>`,
      };
      //console.log(mailOptions)
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log(err);
          return res.status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to send verification email",
            error: err.message,
          });
        } else {
          console.log("Verification email sent: " + info.response);

          User.create(newuser)
            .then((user) => {
              const token = jwt.sign(
                { _id: user._id, username: user.username },
                dbConfig.secret,
                {
                  expiresIn: "5h",
                }
              );
              res.cookie("auth", token);
              const tokenData = new Token({ token, userId: user._id });
              tokenData.save();
              console.log(tokenData)
              //console.log(user)
              res
                .status(HttpStatus.StatusCodes.CREATED)
                .json({ message: "user created successful", user, token });
            })
            .catch((err) => {
              res
                .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: " user not created " });
            });
        }
      });
    });
  },

  async loginUser(req, res) {
  

    if (req.body.google_credentials) {
      const client = new OAuth2Client();
      const ticket = await client.verifyIdToken({
        idToken: req.body.google_credentials.id_token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      const email = payload["email"];
      const user = await User.findOne({ email: email });
      if (!user) {
        return res
          .status(HttpStatus.StatusCodes.NOT_FOUND)
          .json({ message: "User not found" });
      }
      //  if (!user.isVerified) {
      //  return res.status(HttpStatus.StatusCodes.UNAUTHORIZED).json({ message: 'Your email has not been verified yet. Please verify your email and try again.' });
      //  }
      // Generate JWT and set it as a cookie
      const token = jwt.sign(
        { _id: user._id, username: user.username },
        dbConfig.secret,
        {
          expiresIn: "5h",
        }
      );
      res.cookie("auth", token);
      return res
        .status(HttpStatus.StatusCodes.OK)
        .json({ message: "Login successful", user, token });
    }

    //console.log(req.body)
    if (!req.body.email || !req.body.password) {
      return res
        .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "No empty fields allowed" });
    }

    await User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          return res
            .status(HttpStatus.StatusCodes.NOT_FOUND)
            .json({ message: "Username not found" });
        }
        //    if (!user.isVerified) {
        //  return res.status(HttpStatus.StatusCodes.UNAUTHORIZED).json({ message: 'Your email has not been verified yet. Please verify your email and try again.' });
        //    }

        return bcrypt
          .compare(req.body.password, user.password)
          .then((result) => {
            if (!result) {
              return res
                .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
                .json({ message: "Password is incorrect" });
            }

            const token = jwt.sign(
              { _id: user._id, username: user.username },
              dbConfig.secret,
              {
                expiresIn: "5h",
              }
            );
            res.cookie("auth", token);

            return res
              .status(HttpStatus.StatusCodes.OK)
              .json({ message: "Login successful", user, token });
          });
      })
      .catch((err) => {
        return res
          .status(HttpStatus.StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ message: "Error occured login not success" });
      });
  },

  async verifyUser(req, res) {
    const verificationCode = req.query.code;
    User.findOne({ email: req.query.email }, function (err, user) {
      if (err) {
        console.log(err);
        return;
      }

      if (!user) {
        res
          .status(HttpStatus.StatusCodes.NOT_FOUND)
          .json({ message: "User not found" });
        return;
      }

      if (user.verificationCode !== verificationCode) {
        res
          .status(HttpStatus.StatusCodes.NOT_FOUND)
          .json({ message: "Verfifing code invalid" });
        return;
      }

      user.isVerified = true;
      user.save(function (err) {
        if (err) {
          console.log(err);
          return;
        }

        res
          .status(HttpStatus.StatusCodes.OK)
          .json({
            message:
              "Your email has been verified successfully. You can proceed to login now.",
          });
      });
    });
  },

  async RestPassword(req, res) {
    //console.log(req.body.email)
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(HttpStatus.StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Update the user's password in the database
    user.password = hashedPassword;
    await user.save();
    const mailOptions = {
      from: "mihabappual@gmail.com",
      to: req.body.email,
      subject: "Your new password",
      html: `<p>Dear ${req.body.username},</p><p>Your new password is: ${newPassword}</p>`,
    };
    await transporter.sendMail(mailOptions);
    const token = jwt.sign(
      { _id: user._id, username: user.username },
      dbConfig.secret,
      { expiresIn: "1h" }
    );
    const response = {
      message: "Password reset successful",
      newPassword: newPassword,
      token: token,
    };
    return res.status(HttpStatus.StatusCodes.OK).json(response);
  },

  async sendcontactus(req, res) {
    const { name, email, subject, message } = req.body;

    const mailOptions = {
      from: email,
      to: "mihabappual@gmail.com",
      subject: subject,
      html: `<p>Name: ${name}</p><p>Email: ${email}</p><p>Message: ${message}</p>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      return res
        .status(HttpStatus.StatusCodes.OK)
        .json({ message: "Message sent successfully" });
    } catch (err) {
      console.error(err);
      return res
        .status(HttpStatus.StatusCodes.NOT_FOUND)
        .json({ message: "Error sending message" });
    }
  },
};
