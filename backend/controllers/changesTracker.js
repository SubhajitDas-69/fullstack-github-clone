import Repository from "../models/repoModel.js";

export async function trackChanges(commitDir, file, commitMeta, existingFile, repoId, extendedDescription, fileState) {
  try {
    const repo = await Repository.findById(repoId);
    if (!repo) throw new Error("Repository not found");

    let dbCommitGroup = repo.commitChanges.find(c => c.commitId === commitDir);

    const commitEntry = existingFile
      ? {
          fileName: file,
          // message: commitMeta.message,
          oldCommitId: existingFile.commitId,
          newCommitId: commitDir,
          fileState
        }
      : {
          fileName: file,
          // message: commitMeta.message,
          newCommitId: commitDir,
        };

    if (!dbCommitGroup) {
      repo.commitChanges.push({
        commitId: commitDir,
        message: commitMeta.message,
        extendedDescription: extendedDescription || "",
        date: new Date(),
        commits: [commitEntry],
      });
    } else {
      dbCommitGroup.commits.push(commitEntry);
    }

    await repo.save();
  } catch (err) {
    console.error("Error tracking commit changes in DB:", err);
  }
}
