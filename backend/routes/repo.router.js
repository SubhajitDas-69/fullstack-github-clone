import express from "express";
import * as repoController from "../controllers/repoController.js";
import { authorizeRepoOwner } from "../middleware/authorizeMiddleware.js";

const repoRouter = express.Router();

repoRouter.post("/repo/create", repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepository);
repoRouter.get("/repo/:repoId", repoController.fetchRepositoryById);
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/user/:userId", repoController.fetchRepositoryForCurrentUser);
repoRouter.put("/repo/update/:id",authorizeRepoOwner, repoController.updateRepositoryById);
repoRouter.delete("/repo/delete/:id",authorizeRepoOwner, repoController.deleteRepositoryById);
repoRouter.patch("/repo/toggle/:id", repoController.toggleVisibilityById);
// repoRouter.get("/repo/commit/:commitId", repoController.getCommit);

repoRouter.get("/repo/:repoId/commit/:commitId/file/:fileName", repoController.getCommitFile);
repoRouter.get("/repo/:repoId/commits/:commitId", repoController.getCommitDetails);
repoRouter.post("/repo/:id/star/:userId", repoController.starRepo);

// POST /api/repos/:id/unstar
repoRouter.post("/repo/:id/unstar/:userId", repoController.unstarRepo);
// repoRouter.get("/repo/commit/:commitId", repoController.getCommitMeta);

export default repoRouter;
