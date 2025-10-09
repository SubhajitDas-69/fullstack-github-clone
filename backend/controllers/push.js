import { promises as fs } from "fs";
import fsSync from "fs";
import path from "path";
import crypto from "crypto";
import { s3, S3_BUCKET } from "../config/aws-config.js";
import Repository from "../models/repoModel.js";
import { trackChanges } from "./changesTracker.js";
import isRepoOwner from "../middleware/authorizeMiddleware.js";

export async function pushRepo(url) {
  
  const repoId = await isRepoOwner(url);
  if (!repoId) {
    console.error("Permission denied: cannot push to another user's repository");
    process.exit(1);
  }
  const repoPath = path.join(process.cwd(), ".myGit");
  const commitsPath = path.join(repoPath, "commits");
  const stagingPath = path.join(repoPath, "staging");
  if (!fsSync.existsSync(repoPath)) {
    console.log("fatal: not a myGit repository (or any of the parent directories): .myGit");
    process.exit(1);
  }

  try {
    const repo = await Repository.findById(repoId);
    let currentContent = repo.content || [];

    const commitDirs = await fs.readdir(commitsPath);

    for (const commitDir of commitDirs) {
      console.log(commitDir);

      const commitPath = path.join(commitsPath, commitDir);
      const files = await fs.readdir(commitPath);

      const commitJsonPath = path.join(commitPath, "commit.json");
      let commitMeta = { message: "No message", date: new Date() };
      try {
        const commitJson = await fs.readFile(commitJsonPath, "utf-8");
        commitMeta = JSON.parse(commitJson);
      } catch {
        console.log(`No commit.json found in ${commitDir}`);
      }

      for (const file of files) {
        if (file === "commit.json" || file === "metadata.json") continue;

        const filePath = path.join(commitPath, file);
        const fileContent = await fs.readFile(filePath);
        const newHash = crypto.createHash("sha256").update(fileContent).digest("hex");
        console.log(file);

        const existingFile = currentContent.find(f => f.fileName === file);

        if (existingFile) {
          console.log(existingFile);

          let stagedMeta = null;
          try {
            const stagedMetaPath = path.join(stagingPath, "metadata.json");
            const metaContent = await fs.readFile(stagedMetaPath, "utf-8");
            const metaArray = JSON.parse(metaContent);
            stagedMeta = metaArray.find(m => m.fileName === file);
          } catch (err) {
            console.log("no metadata.json found");
          }

          if (stagedMeta && existingFile.hash == stagedMeta.hash) {
            console.log(`No changes detected in "${file}". Skipping upload.`);
            continue;
          }
          if (new Date(existingFile.date) >= new Date(commitMeta.date) || !stagedMeta) {
            console.log(`existingFile Date: ${existingFile.date} and old file date: ${commitMeta.date}`);
            console.log(`No changes detected in "${file}". Skipping upload.`);
            continue;
          }
          console.log(`Changes detected in "${file}". Replacing old version.`);
          await trackChanges(commitDir, file, commitMeta, existingFile, repoId, "", "modified");

          currentContent = currentContent.filter(f => f.fileName !== file);
        } else {
          console.log(`New file "${file}".`);
          await trackChanges(commitDir, file, commitMeta, null, repoId);
        }
        const params = {
          Bucket: S3_BUCKET,
          Key: `${repoId}/${file}/commits/${commitDir}/${file}`,
          Body: fileContent,
        };
        await s3.upload(params).promise();

        currentContent.push({
          commitId: commitDir,
          fileName: file,
          message: commitMeta.message,
          date: commitMeta.date || new Date(),
          hash: newHash
        });
        console.log(`Pushed ${file} to S3 (commit ${commitDir})`);
      }
    }

    await Repository.findByIdAndUpdate(repoId, {
      $set: { content: currentContent },
    });

    const stagedFiles = await fs.readdir(stagingPath);
    for (const stagedFile of stagedFiles) {
      await fs.unlink(path.join(stagingPath, stagedFile));
    }
    console.log("========================");
    console.log("All commits pushed to S3");
  } catch (err) {
    console.error("Error pushing to S3:", err);
    throw err;
  }
}