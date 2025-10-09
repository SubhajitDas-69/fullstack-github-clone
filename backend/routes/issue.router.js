import express from "express";
import * as issueController from "../controllers/issueController.js";
import { authorizeIssueDeletionAccess, } from "../middleware/authorizeMiddleware.js";

const issueRouter = express.Router();

issueRouter.post("/issue/:userId/create/:id", issueController.createIssue);
issueRouter.put("/issue/update/:id/user/:userId", issueController.updateIssueById);
issueRouter.delete("/issue/delete/:issueId",authorizeIssueDeletionAccess, issueController.deleteIssueById);
issueRouter.get("/issue/all/:id", issueController.getAllIssues);
issueRouter.get("/issue/:id", issueController.getIssueById);
issueRouter.put("/issue/close/:id/user/:userId", issueController.closeIssueById);
issueRouter.put("/issue/open/:id/user/:userId", issueController.reOpenIssueById);
issueRouter.post("/issues/check-issue/:repoId", issueController.createIssueRef);
issueRouter.post("/issues/:issueId/comment/:userId", issueController.handleCommentOnIssue);

export default issueRouter;
