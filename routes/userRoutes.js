import express from "express";
const router = express.Router();
import {
  signup_user,
  user_login,
  delete_user,
  getAllUsers,
  getUserById,
  getUserByDonorId,
  editUser,
  isLoggedIn,
} from "../controllers/userController.js";
import { authenticateUser, authenticateAdmin } from "../middleware/authMiddleware.js";

// Public routes accessible to all users
router.post("/register", signup_user);
router.post("/login", user_login);

// check if the user is logged in
router.get("/is-logged-in", isLoggedIn);
// // Protected routes accessible to authenticated users
// router.get("/:id", authenticateUser , getUserById);
// router.put("/:id", authenticateUser, editUser);
// router.patch("/:id", authenticateUser, editUser);

// // Protected routes accessible to admins only
// router.get("/", authenticateAdmin, getAllUsers);
// router.delete("/:id", authenticateUser, delete_user);
// Protected routes accessible to authenticated users
router.get("/:id", getUserById);
router.get("/donor/:donorId", getUserByDonorId);

router.put("/:id", editUser);
router.patch("/:id", editUser);



// Protected routes accessible to admins only
router.get("/", getAllUsers);
router.delete("/:id", delete_user);

export default router;
