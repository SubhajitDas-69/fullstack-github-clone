import { promises as fs } from "fs";
import fsSync from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import Issue from "../models/issueModel.js";

export async function commitRepo(message) {
    const repoPath = path.join(process.cwd(), ".myGit");
    const commitsPath = path.join(repoPath, "commits");
    const stagingPath = path.join(repoPath, "staging");
    if (!fsSync.existsSync(repoPath)) {
        console.log("fatal: not a myGit repository (or any of the parent directories): .myGit");
        process.exit(1);
    }
    try {
        const commitID = uuidv4();
        const commitDir = path.join(commitsPath, commitID);
        await fs.mkdir(commitDir, { recursive: true });

        const files = await fs.readdir(stagingPath);
        for (let file of files) {
            fs.copyFile(path.join(stagingPath, file), path.join(commitDir, file));
        }
        const commitData = {
            id: commitID,
            message,
            date: new Date().toISOString(),
        };
        await fs.writeFile(
            path.join(commitDir, "commit.json"),
            JSON.stringify(commitData, null, 2)
        );
        console.log(`Commit ${commitID} created with message : ${message}`);

        return commitData;
    } catch (err) {
        console.error("Error committing files", err);
    }
}