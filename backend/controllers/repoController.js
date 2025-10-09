import mongoose from 'mongoose';
import Repository from '../models/repoModel.js';
import User from '../models/userModel.js';
import { s3, S3_BUCKET } from "../config/aws-config.js";
import Issue from '../models/issueModel.js';
import path from 'path';
import { promises as fs } from "fs";
import mime from "mime-types";


export const createRepository = async (req, res) => {
    const { owner, name, description, visibility } = req.body;
    try {
        if (!name) {
            return res.status(400).json({ error: "Repository name is required!" });
        }
        if (!mongoose.Types.ObjectId.isValid(owner)) {
            return res.status(400).json({ error: "Invalid User Id!" });
        }

        const newRepository = Repository({
            name, description, visibility, owner
        });

        const result = await newRepository.save();
        const user = await User.findById(owner);
        if (!user) {
            return res.status(404).json({ error: "User not found!" });
        }

        user.repositories.push(result._id);
        await user.save();

        res.status(201).json({
            message: "Repository created!",
            reposioryID: result._id
        });

    } catch (err) {
        console.error("Error during repository creation! : ", err.message);
        res.status(500).send("Server error!");
    }
};

export const getAllRepository = async (req, res) => {
    try {
        const repositories = await Repository.find({}).populate("owner").populate("openedIssues");
        const repo = repositories.filter(repo => repo.visibility === "public");
        res.json(repo);
    } catch (err) {
        console.error("Error during repository creation! : ", err.message);
        res.status(500).send("Server error!");
    }
};

export const fetchRepositoryById = async (req, res) => {
    const { repoId } = req.params;
    try {
        const repo = await Repository.findById(repoId)
        .populate("owner")
        .populate("openedIssues")
        .populate("closedIssues")
        if (!repo) return res.status(404).json({ error: "Repository not found" });
        if(repo.visibility === "private" && repo.owner._id.toString() !== req.userId) {
            return res.status(403).json({ error: "Access denied. This repository is private." });
        }
        res.status(200).json(repo);
    } catch (err) {
        console.error("Error fetching repo content: ", err);
        res.status(500).json({ error: "Server error!" });
    }
};

export const fetchRepositoryByName = async (req, res) => {
    const repoName = req.params.name;
    try {
        const repository = await Repository.findOne({ name: repoName })
        .populate("owner")
        .populate("openedIssues")
        .populate("closedIssues");
        if(repository.visibility === "private" && repository.owner._id.toString() !== req.userId) {
            return res.status(403).json({ error: "Access denied. This repository is private." });
        }
        res.json(repository);
    } catch (err) {
        console.error("Error during fetching repository! : ", err.message);
        res.status(500).send("Server error!");
    }
};

export const fetchRepositoryForCurrentUser = async (req, res) => {
    const userId = req.params.userId;

    try {
        const repositories = await Repository.find({ owner: userId }).populate("owner");

        if (!repositories || repositories.length == 0) {
            return res.status(404).json({ error: "User Repositories not found!" });
        }
        res.json({ message: "Repositories found", repositories });
    } catch (err) {
        console.error("Error during fetching user repository! : ", err.message);
        res.status(500).send("Server error!");
    }

};

export const updateRepositoryById = async (req, res) => {
  const { id } = req.params;
  const { name, description} = req.body;

  try {
    const updatedRepository = await Repository.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );

    if (!updatedRepository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({
      message: "Repository updated successfully",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error updating repository:", err.message);
    res.status(500).send("Server error!");
  }
};

export const toggleVisibilityById = async (req, res) => {
    const { id } = req.params;
    const { visibility } = req.body;

    try {
        const repository = await Repository.findById(id);
        if (!repository) {
            return res.status(404).json({ error: "Repository not found!" });
        }
        repository.visibility = visibility;

        const updatedRepository = await repository.save();
        res.json({
            message: "Repository visibility toggled Successfully",
            repository: updatedRepository
        });
    } catch (err) {
        console.error("Error during toggling visibility! : ", err.message);
        res.status(500).send("Server error!");
    }
};

export const deleteRepositoryById = async (req, res) => {
  const { id } = req.params;
  try {
    const repository = await Repository.findByIdAndDelete(id);

    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }
    const deleteAllRepoFiles = async (repoId) => {
      let isTruncated = true;
      let continuationToken = null;

      while (isTruncated) {
        const listParams = {
          Bucket: S3_BUCKET,
          Prefix: `${repoId}/`,
          ContinuationToken: continuationToken || undefined,
        };
        const listedObjects = await s3.listObjectsV2(listParams).promise();

        if (listedObjects.Contents && listedObjects.Contents.length > 0) {
          const deleteParams = {
            Bucket: S3_BUCKET,
            Delete: {
              Objects: listedObjects.Contents.map((obj) => ({ Key: obj.Key })),
            },
          };

          await s3.deleteObjects(deleteParams).promise();
        }

        isTruncated = listedObjects.IsTruncated;
        continuationToken = listedObjects.NextContinuationToken;
      }
    };
    await deleteAllRepoFiles(id);

    res.json({ message: "Repository and all associated AWS files deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository! :", err);
    res.status(500).send("Server error!");
  }
};

export async function getCommitFile(req, res) {
  const { commitId, fileName, repoId } = req.params;

  try {
    // const repo = await Repository.findById(repoId);
    // const commitChanges = repo.commitChanges.find((c)=> c.commitId === commitId);
    // const commit = commitChanges.commits.find((f)=>f.fileName === fileName);
    // commit.fileState
    const params = {
      Bucket: S3_BUCKET,
      Key: `${repoId}/${fileName}/commits/${commitId}/${fileName}`,
    };
    const response = await s3.getObject(params).promise();
    const mimeType = mime.lookup(fileName) || "application/octet-stream";
    if (mimeType.startsWith("image/")) {
      res.setHeader("Content-Type", mimeType);
      res.send(response.Body);
    } else {
      const content = response.Body.toString("utf-8");
      res.json({ name: fileName, content });
    }
  } catch (err) {
    console.error("Error fetching file from S3 (v2):", err.message);
    res.status(500).json({ error: "Failed to load file" });
  }
}

export async function getCommitDetails(req, res) {
  const { commitId, repoId } = req.params;

  try {
    const repo = await Repository.findById(repoId);
    const commitChanges = repo.commitChanges.find(c =>c.commitId === commitId);
    if(!commitChanges) {
      return res.json([]);
    }

    const results = [];

    for (const commit of commitChanges.commits) {
      let oldContent = null;
      let newContent = null;
      let isImage = false;
      if (commit.fileName.match(/\.(png|jpg|jpeg|gif)$/i)) {
        isImage = true;
        if (commit.newCommitId) {
          const newParams = {
            Bucket: S3_BUCKET,
            Key: `${repoId}/${commit.fileName}/commits/${commit.newCommitId}/${commit.fileName}`,
          };
          newContent = s3.getSignedUrl("getObject", newParams);
        }
    }else{
      if (commit.oldCommitId) {
        try {
          const oldParams = {
            Bucket: S3_BUCKET,
            Key: `${repoId}/${commit.fileName}/commits/${commit.oldCommitId}/${commit.fileName}`,
          };
          const oldResponse = await s3.getObject(oldParams).promise();
          oldContent = oldResponse.Body.toString("utf-8");
        } catch (err) {
          console.log(
            `No old file found for ${commit.fileName} at commit ${commit.oldCommitId}:`,
            err.message
          );
        }
      }
      if (commit.newCommitId && commit.fileState != "deleted") {
        try {
          const newParams = {
            Bucket: S3_BUCKET,
            Key: `${repoId}/${commit.fileName}/commits/${commit.newCommitId}/${commit.fileName}`,
          };
          const newResponse = await s3.getObject(newParams).promise();
          newContent = newResponse.Body.toString("utf-8");
        } catch (err) {
          console.log(
            `No new file found for ${commit.fileName} at commit ${commit.newCommitId}:`,
            err.message
          );
        }
      }
    }
      results.push({
        message: commitChanges.message,
        extendedDescription: commitChanges.extendedDescription || "",
        date: commitChanges.date?.toISOString() || null,
        fileName: commit.fileName,
        oldCommitId: commit.oldCommitId,
        newCommitId: commit.newCommitId,
        oldContent,
        newContent,
        isImage,
        fileState: commit.fileState
      });
    }
    res.json(results);
  } catch (err) {
    console.error("Error fetching all commit files:", err.message);
    res.status(500).json({ error: "Failed to fetch commit files" });
  }
}

export const starRepo = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const repo = await Repository.findById(id);
    const user = await User.findById(userId);

    if (!repo) return res.status(404).json({ message: "Repo not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!repo.starredBy.includes(userId)) {
      repo.starredBy.push(userId);
      repo.stars = repo.starredBy.length;

      if (!user.starRepos.includes(repo._id)) {
        user.starRepos.push(repo._id);
      }

      await repo.save();
      await user.save();
    }
    const starredRepos = user.starRepos;

    res.json({
      success: true,
      stars: repo.stars,
      starredRepos,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const unstarRepo = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const repo = await Repository.findById(id);
    const user = await User.findById(userId);

    if (!repo) return res.status(404).json({ message: "Repo not found" });
    if (!user) return res.status(404).json({ message: "User not found" });

    repo.starredBy = repo.starredBy.filter(
      (uid) => uid.toString() !== userId.toString()
    );
    repo.stars = repo.starredBy.length;

    user.starRepos = user.starRepos.filter(
      (rid) => rid.toString() !== repo._id.toString()
    );

    await repo.save();
    await user.save();
    
    const populatedUser = await user.populate("starRepos");
    const starredRepos = populatedUser.starRepos.map((r) => r._id);

    res.json({
      success: true,
      stars: repo.stars,
      starredRepos,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};