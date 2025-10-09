import express from "express";
import * as createFileController from "../controllers/createFileController.js";



const repoRouter = express.Router();

repoRouter.post("/create-file", createFileController.createFile);
repoRouter.post("/update/file",createFileController.editFile);
repoRouter.delete("/file/delete",createFileController.deleteFile);

export default repoRouter;
