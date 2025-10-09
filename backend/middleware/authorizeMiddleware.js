import Issue from "../models/issueModel.js";
import Repository from "../models/repoModel.js";

export default async function isRepoOwner(url) {
const urlPattern = /^\/GitHub\/CurrentUser\/([^/]+)\/repo\/([^/]+)$/;
const pathname = new URL(url).pathname;
const match = pathname.match(urlPattern);
if (!match) {
  console.error("Invalid URL format. Expected: /GitHub/CurrentUser/:userId/repo/:repoId");
  process.exit(1);
}
const currentUserId = match[1];
const repoId = match[2];
  const repo = await Repository.findById(repoId);
    if (!repo) {
        return false;
    }
    if(repo.owner.toString() === currentUserId.toString()) {
        return repoId;
    }
    return false;
}

export const authorizeRepoOwner = async (req, res, next) => {
  try {
    const repoId = req.params.id || req.body.repoId;
    
    const repo = await Repository.findById(repoId);

    if (!repo) {
      return res.status(404).json({ success: false, message: "Repository not found" });
    }
    if (req.userId !== String(repo.owner)) {
      return res.status(403).json({ 
        success: false, 
        message: "You do not have permission to perform this action" 
      });
    }
    next();

  } catch (err) {
    console.error("Authorization middleware error", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const authorizeIssueDeletionAccess = async (req, res, next) => {
  try {
    const { issueId } = req.params;
    const issue = await Issue.findById(issueId).populate("repository");

    if (!issue) {
      return res.status(404).json({ success: false, message: "Issue not found" });
    }

    if (issue.repository.owner.toString() !== req.userId) {
      return res.status(403).json({ 
        success: false, 
        message: "You do not have permission to delete this issue" 
      });
    }
    next();
  } catch (err) {
    console.error("Authorization middleware error", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};