import express from "express";
import * as userController from "../controllers/userController.js";
import {authMiddleware} from "../middleware/authMiddleware.js";

const userRouter = express.Router();

userRouter.get("/allUsers", authMiddleware, userController.getAllUsers);
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.get("/userProfile/:id",authMiddleware, userController.getUserProfile);
userRouter.put("/updateProfile/:id",authMiddleware, userController.updateUserProfile);
userRouter.delete("/deleteProfile/:id",authMiddleware, userController.deleteUserProfile);
userRouter.post("/:id/follow", authMiddleware, userController.followUser);
userRouter.post("/:id/unfollow", authMiddleware, userController.unfollowUser);
userRouter.get("/:id/followers", authMiddleware, userController.getFollowers);
userRouter.get("/:id/following", authMiddleware, userController.getFollowing);

export default userRouter;
