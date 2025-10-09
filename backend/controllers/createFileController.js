import { s3, S3_BUCKET } from "../config/aws-config.js";
import Repository from "../models/repoModel.js";
import { v4 as uuidv4 } from "uuid";
import { trackChanges } from "./changesTracker.js";
import crypto from "crypto";

export const createFile = async (req, res) => {
  try {
    const { fileName, content, message, repoId, extendedDescription } = req.body;
    const repo = await Repository.findById(repoId);
    let currentContent = repo.content || [];
    const exists = currentContent.some(f => f.fileName === fileName);
    if (exists) {
      const errorMsg = "There was an error committing your changes: A file with the same name already exists. Please choose a different name and try again.";
      console.error(errorMsg);
      return res.status(400).json({ success: false, message: errorMsg });
    } else {
      const commitDir = uuidv4();
      let commitMeta = { message: message, date: new Date() };
      const newHash = crypto.createHash("sha256").update(content).digest("hex");
      await trackChanges(commitDir, fileName, commitMeta, null, repoId, extendedDescription)

      const params = {
        Bucket: S3_BUCKET,
        Key: `${repoId}/${fileName}/commits/${commitDir}/${fileName}`,
        Body: content,
      };
      await s3.upload(params).promise();
      currentContent.push({
        commitId: commitDir,
        fileName: fileName,
        message: commitMeta.message,
        date: commitMeta.date || new Date(),
        hash: newHash
      });
      await Repository.findByIdAndUpdate(repoId, {
        $set: { content: currentContent },
      });

      res.json({ success: true, message: `File ${fileName} created!` });
    }
  } catch (err) {
    console.log("Error during file creation", err);
  }
}

export const editFile = async (req, res) => {
  try {
    const { fileName, content, message, repoId, extendedDescription } = req.body;

    if (!repoId || !fileName) {
      return res.status(400).json({ success: false, message: "repoId and fileName are required" });
    }

    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ success: false, message: "Repository not found" });
    }
    const existingFileObj = repo.content.find((f) => f.fileName === fileName) || null;

    const commitDir = uuidv4();
    const commitMeta = { message: message || `Updated ${fileName}`, date: new Date() };
    const newHash = crypto.createHash("sha256").update(content).digest("hex");
    await trackChanges(commitDir, fileName, commitMeta, existingFileObj, repoId, extendedDescription, "modified");

    const params = {
      Bucket: S3_BUCKET,
      Key: `${repoId}/${fileName}/commits/${commitDir}/${fileName}`,
      Body: content,
    };
    await s3.upload(params).promise();

    const updatedContent = (repo.content || []).filter((f) => f.fileName !== fileName);
    updatedContent.push({
      commitId: commitDir,
      fileName,
      message: commitMeta.message,
      date: commitMeta.date,
      hash: newHash,
    });

    await Repository.findByIdAndUpdate(
      repoId,
      { $set: { content: updatedContent } },
      { new: true }
    );
    return res.json({
      success: true,
      message: `File ${fileName} updated!`,
      commitId: commitDir,
    });
  } catch (err) {
    console.error("Error in editFile:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { repoId, fileName, message,  extendedDescription } = req.body;
    if (!repoId || !fileName) {
      return res.status(400).json({ success: false, message: "repoId, fileName and commitId are required" });
    }
    const repo = await Repository.findById(repoId);
    if (!repo) {
      return res.status(404).json({ success: false, message: "Repository not found" });
    }
    const existingFileObj = repo.content.find((f) => f.fileName === fileName) || null;
    if (!existingFileObj) {
      return res.status(404).json({ success: false, message: "File not found in repository" });
    }

    // const s3Params = {
    //   Bucket: S3_BUCKET,
    //   Key: `${repoId}/${fileName}/commits/${commitId}/${fileName}`,
    // };

    // try {
    //   await s3.deleteObject(s3Params).promise();
    //   console.log(`Deleted ${fileName} from S3`);
    // } catch (s3Err) {
    //   console.error("Error deleting file from S3:", s3Err);
    // }

    const commitDir = uuidv4();
    const commitMeta = { message: message || `Deleted ${fileName}`, date: new Date() };
    await trackChanges(commitDir, fileName, commitMeta, existingFileObj, repoId, extendedDescription, "deleted");
   await Repository.findByIdAndUpdate(
      repoId,
      { $pull: { content: { fileName }}},
      { new: true }
    );
    return res.json({
      success: true,
      message: `File ${fileName} deleted!`,
    });

  } catch (err) {
    console.error("Error in deleteFile:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}