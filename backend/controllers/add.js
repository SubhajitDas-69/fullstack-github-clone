import { promises as fs } from "fs";
import fsSync from "fs";
import path from "path";
import crypto from "crypto";

export async function addRepo(filePath) {
    const repoPath = path.join(process.cwd(), ".myGit");
    console.log(repoPath);
    
    const stagingPath = path.join(repoPath, "staging");
    if (!fsSync.existsSync(repoPath)) {
        console.log("fatal: not a myGit repository (or any of the parent directories): .myGit");
        process.exit(1);
    }
    
    const absFilePath = path.resolve(filePath);
    const absRepoPath = path.resolve(repoPath, "..");
    if (!absFilePath.startsWith(absRepoPath)) {
        console.log(`fatal: '${filePath}': '${filePath}' is outside repository at '${absRepoPath}'`);
        process.exit(1);
    }
    
    try {
        const fileContent = await fs.readFile(filePath);
        await fs.mkdir(stagingPath, { recursive: true });
        const fileName = path.basename(filePath);
        await fs.copyFile(filePath, path.join(stagingPath, fileName));
        const hash = crypto.createHash("sha256").update(fileContent).digest("hex");
        const metaData = {
            fileName,
            hash,
            date: new Date().toISOString(),
        };

        let fileDetails = [];

        const metadataFile = path.join(stagingPath, "metadata.json");
        try {
            const existing = await fs.readFile(metadataFile, "utf-8");
            fileDetails = JSON.parse(existing);
        } catch {
            fileDetails = [];
        }
        fileDetails = fileDetails.filter(f => f.fileName !== fileName);
        fileDetails.push(metaData);

        await fs.writeFile(metadataFile, JSON.stringify(fileDetails, null, 2));


        console.log(`File ${fileName} added to the staging area!`);
        return metaData;
    } catch (err) {
        console.log("Error adding file : ", err);

    }

}