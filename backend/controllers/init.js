import {promises as fs} from "fs";
import path from "path";
import { S3_BUCKET } from "../config/aws-config.js";

export async function initRepo() {
    const repoPath = path.resolve(process.cwd(), ".myGit");
    const commitsPath = path.join(repoPath, "commits");

    try{
        await fs.mkdir(repoPath, {recursive: true});
        await fs.mkdir(commitsPath, {recursive: true});
        await fs.writeFile(
            path.join(repoPath, "config.json"),
            JSON.stringify({
                Bucket: S3_BUCKET,
            })
        );
        console.log("Repository initialized");
        
    }catch(err) {
        console.log("Error initializing repository",err);
        
    }
}