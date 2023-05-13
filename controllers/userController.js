import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import { generateToken } from "../controllers/authController.js";
import mongoose from "mongoose";

//get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    // Paginate users using mongoose-paginate-v2
    const options = {
      page: pageNumber || 1,
      limit: limitNumber || 10,
    };

    const users = await User.paginate({}, options);

    return res.status(200).json({
      users: users.docs,
      totalPages: users.totalPages,
      currentPage: users.page,
      limit: users.limit,
      totalUsers: users.totalDocs,
    });
  } catch (err) {
    next(err);
  }
};

//get an user by id
export const getUserById = async (req, res, next) => {
  try {
    let { id } = req.params;
    let user = await User.findOne({ _id: id });
    if (!user) {
      throw new Error("User not found");
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    if (error instanceof mongoose.CastError) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(404).json({ success: false, message: error.message });
  }
};

// User Registration
export const signup_user = async (req, res, next) => {
  try {
    const { fullName, email, password, phoneNumber, Address, isAdmin } =
      req.body;

    if (!fullName) {
      return res.status(400).json({
        message: "Full Name is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "Password is required",
      });
    }

    if (!phoneNumber) {
      return res.status(400).json({
        message: "Phone Number is required",
      });
    }

    if (!Address) {
      return res.status(400).json({
        message: "Address is required",
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser)
      return res.status(409).json({
        message: "Email already exists",
      });

    // Check if phone number already exists
    const existingPhone = await User.findOne({
      phoneNumber: req.body.phoneNumber,
    });
    if (existingPhone) {
      return res.status(409).json({
        message: "Phone Number already exists",
      });
    }

    const newUser = new User({
      fullName: fullName,
      email: email,
      password: password,
      phoneNumber: phoneNumber,
      Address: Address,
      isAdmin: isAdmin,
    });

    await newUser
      .save()
      .then((response) => {
        let message = "User Created";
        if (isAdmin === true) {
          message = "Admin Created";
        }
        res.status(201).json({
          success: true,
          response,
          message,
        });
      })
      .catch((err) => {
        res.status(400).json({ success: false, err });
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message,
    });
  }
};

//User login
export const user_login = async (req, res, next) => {
  try {
    // Check if email and password are provided
    const { email, password } = req.body;

    // Check if email exists in database
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check if password is correct
    const isValidPassword = await user.isValidPassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Wrong password" });
    }

    // Generate and send authentication token
    const token = generateToken({
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    }); // Customize token payload as needed
    res.cookie("userToken", token, { httpOnly: true }); // Set the token as a cookie, or send it in the response body as needed
    res.json({ id: user._id, email: user.email, isAdmin: user.isAdmin, token });
  } catch (error) {
    next(error);
  }
};

//update a user by id
export const editUser = async (req, res, next) => {
  let { id } = req.params;
  const { fullName, email, password, address, phoneNumber, role } = req.body;

  try {
    // check if admin already exists
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).send("User already exists, please login");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // password = hashedPassword;
    const response = await User.findOneAndUpdate(
      { _id: id },
      {
        fullName: fullName,
        email: email,
        password: hashedPassword,
        address: address,
        phoneNumber: phoneNumber,
        isAdmin: isAdmin,
      },
      {
        new: true,
      }
    );
    res.status(200).send({ success: true, response });
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

//delete user
export const delete_user = async (req, res, next) => {
  try {
    const result = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      result,
      message: "User deleted successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
};
