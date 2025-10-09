import express from "express";
import userRouter from "./user.router.js";
import repoRouter from "./repo.router.js";
import issueRouter from "./issue.router.js";
import createFile from "./createFile.router.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRepoOwner } from "../middleware/authorizeMiddleware.js";


const mainRouter = express.Router();

mainRouter.use(userRouter);
mainRouter.use(authMiddleware, repoRouter);
mainRouter.use(authMiddleware, issueRouter);
mainRouter.use(authMiddleware, authorizeRepoOwner, createFile);

export default mainRouter;