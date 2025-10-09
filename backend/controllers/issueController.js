import mongoose from 'mongoose';
import Repository from '../models/repoModel.js';
import User from '../models/userModel.js';
import Issue from '../models/issueModel.js';
import IssueActivity from "../models/issueActivityModel.js";

export const createIssue = async (req, res) => {
  const { title, description } = req.body;
  const { id, userId } = req.params;
  try {
    const issue = new Issue({
      title,
      description,
      repository: id,
      status: "open",
      openedBy: userId
    });

    await issue.save();
    const repo = await Repository.findById(id);
    repo.openedIssues.push(issue._id);
    await repo.save();

    res.status(201).json({ issueId: issue._id });
  } catch (err) {
    console.error("Error during issue creation! : ", err.message);
    res.status(500).send("Server error!");
  }
};

export const updateIssueById = async (req, res) => {
  const { id, userId } = req.params;
  const { title, description } = req.body;
  try {
    const issue = await Issue.findById(id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }
    issue.title = title || issue.title;
    issue.description = description || issue.description;

    await issue.save();

    const activity = await IssueActivity.create({
      issue: issue._id,
      user: userId,
      action: "updated",
      details: "Updated issue details",
    });
    await Issue.findByIdAndUpdate(issue._id, {
      $push: { issueActivities: activity._id },
    });
    const activities = await IssueActivity.find({ issue: id })
      .populate("user")
      .sort({ createdAt: 1 });

    res.json({ issue, activities });
  } catch (err) {
    console.error("Error during updating issue! : ", err.message);
    res.status(500).send("Server error!");
  }
};

export const deleteIssueById = async (req, res) => {
  const { issueId } = req.params;

  try {
    const issue = await Issue.findByIdAndDelete(issueId);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found!" });
    }
    res.json({ message: "Issue Deleted" })
  } catch (err) {
    console.error("Error during deleting issue! : ", err.message);
    res.status(500).send("Server error!");
  }
};

export const getAllIssues = async (req, res) => {
  const { id } = req.params;
  try {
    const issues = await Issue.find({ repository: id }).populate("openedBy");

    if (!issues) {
      return res.status(404).json({ error: "Issue not found!" });
    }
    res.status(200).json(issues);
  } catch (err) {
    console.error("Error during issue fetching! : ", err.message);
    res.status(500).send("Server error!");
  }
};

export const getIssueById = async (req, res) => {
  const { id } = req.params;
  try {
    const issue = await Issue.findById(id)
      .populate("repository")
      .populate("openedBy")

    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const activities = await IssueActivity.find({ issue: id })
      .populate("user")
      .sort({ createdAt: 1 });

    res.json({ issue, activities });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const closeIssueById = async (req, res) => {
  const { id, userId } = req.params;
  try {
    let issue = await Issue.findById(id)
      .populate("repository")
      .populate("openedBy")

    if (!issue) return res.status(404).json({ error: "Issue not found!" });

    const isOpener = issue.openedBy?._id.toString() === userId;
    const isRepoOwner = issue.repository?.owner?.toString() === userId;

    if (!isOpener && !isRepoOwner) {
      return res.status(403).json({ error: "You are not allowed to close this issue!" });
    }

    issue.status = "closed";
    issue.closedBy = userId;
    await issue.save();

    await Repository.findByIdAndUpdate(issue.repository._id, {
      $pull: { openedIssues: issue._id },
      $push: { closedIssues: issue._id }
    });
    const activity = await IssueActivity.create({
      issue: issue._id,
      user: userId,
      action: "closed",
      details: "Closed the issue",
    });
    await Issue.findByIdAndUpdate(issue._id, {
      $push: { issueActivities: activity._id },
    });
    issue = await Issue.findById(id).populate("openedBy").populate("repository");
    const activities = await IssueActivity.find({ issue: id })
      .populate("user")
      .sort({ createdAt: 1 });

    res.json({ issue, activities });
  } catch (err) {
    res.status(500).send("Server error!");
  }
};

export const reOpenIssueById = async (req, res) => {
  const { id, userId } = req.params;

  try {
    let issue = await Issue.findById(id)
      .populate("repository")
      .populate("openedBy");
    if (!issue) return res.status(404).json({ error: "Issue not found!" });

    if (issue.status !== "closed") {
      return res.status(400).json({ message: "You have to close the issue first before reopening!" });
    }
    if (issue.closedBy?.toString() === userId) {
      issue.closedBy = null;
    }

    const isOpener = issue.openedBy?._id.toString() === userId;
    const isRepoOwner = issue.repository?.owner?.toString() === userId;

    if (!isOpener && !isRepoOwner) {
      return res.status(403).json({ error: "You are not allowed to reopen this issue!" });
    }

    issue.status = "open";
    await issue.save();
    const activity = await IssueActivity.create({
      issue: issue._id,
      user: userId,
      action: "reopened",
      details: "Reopened the issue",
    });

    await Issue.findByIdAndUpdate(issue._id, {
      $push: { issueActivities: activity._id },
    });
    await Repository.findByIdAndUpdate(issue.repository._id, {
      $pull: { closedIssues: issue._id },
      $addToSet: { openedIssues: issue._id }
    });
    issue = await Issue.findById(id).populate("openedBy").populate("repository");
    const activities = await IssueActivity.find({ issue: id })
      .populate("user")
      .sort({ createdAt: 1 });

    res.json({ issue, activities });
  } catch (err) {
    console.error("Error reopening issue:", err.message);
    res.status(500).send("Server error!");
  }
};

export const createIssueRef = async (req, res) => {
  try {
    const { repoId } = req.params;
    const { issues } = req.body;

    if (!repoId || !Array.isArray(issues)) {
      return res.status(400).json({ success: false, message: "Invalid request" });
    }
    const repo = await Repository.findById(repoId);

    if (!repo) {
      return res.status(404).json({ success: false, message: "Repository not found" });
    }

    for (const issueObj of issues) {
      const { issueId, message, commitId, repoOwner } = issueObj;
      const exists =
        (repo.openedIssues && repo.openedIssues.some((i) => i.toString() === issueId)) ||
        (repo.closedIssues && repo.closedIssues.some((i) => i.toString() === issueId));

      if (!exists) {
        console.warn(`Issue ${issueId} not found in repo ${repoId}`);
        continue;
      }
      const alreadyLogged = await IssueActivity.findOne({
        issue: issueId,
        user: repoOwner,
        action: "add commit",
        commitId: commitId,
      });

      if (alreadyLogged) continue;

      let activity = await IssueActivity.create({
        issue: issueId,
        user: repoOwner,
        action: "add commit",
        details: `added a commit that references this issue: ${message}`,
        commitId: commitId,
      });
      await Issue.findByIdAndUpdate(issueId, {
        $push: { issueActivities: activity._id },
      });

    }
    return res.json({ success: true, message: "Issues processed successfully" });
  } catch (err) {
    console.error("Error checking repository issues:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
export const handleCommentOnIssue = async (req, res) => {
  try {
    const { userId, issueId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.json({ message: "Comment is required!" });
    }
    const activity = await IssueActivity.create({
      issue: issueId,
      user: userId,
      action: "comments",
      comments: comment
    });
    await Issue.findByIdAndUpdate(issueId, {
      $push: { issueActivities: activity._id },
    });

    const issue = await Issue.findById(issueId).populate("openedBy");
    const activities = await IssueActivity.find({ issue: issueId })
      .populate("user")
      .sort({ createdAt: 1 });

    res.json({ issue, activities });
  } catch (err) {
    console.error("Error during submiting comment :", err);
  }
}