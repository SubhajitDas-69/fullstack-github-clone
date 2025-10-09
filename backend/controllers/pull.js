import { promises as fs } from "fs";
import path from "path";
import { s3, S3_BUCKET } from "../config/aws-config.js";

export async function pullRepo(repoId) {
  const cwd = process.cwd();

  try {
    const data = await s3
      .listObjectsV2({
        Bucket: S3_BUCKET,
        Prefix: `${repoId}/`,
      })
      .promise();

    if (!data.Contents || data.Contents.length === 0) {
      console.log(`No commits found for repo: ${repoId}`);
      return;
    }

    const filesMap = {};
    for (const obj of data.Contents) {
      if (obj.Key.endsWith("/")) continue;

      const parts = obj.Key.split("/");
      const fileName = parts[1];
      if (!filesMap[fileName]) filesMap[fileName] = [];
      filesMap[fileName].push(obj);
    }

    console.log(`Pulling latest version of ${Object.keys(filesMap).length} files`);

    for (const [fileName, versions] of Object.entries(filesMap)) {
      const latestObj = versions.sort(
        (a, b) => b.LastModified - a.LastModified
      )[0];

      const localPath = path.join(cwd, fileName);
      await fs.mkdir(path.dirname(localPath), { recursive: true });

      const fileContent = await s3
        .getObject({ Bucket: S3_BUCKET, Key: latestObj.Key })
        .promise();

      await fs.writeFile(localPath, fileContent.Body);

      console.log(`Pulled latest ${fileName}`);
    }

    console.log(`Repo ${repoId} synced successfully into ${cwd}`);
  } catch (err) {
    console.error("Unable to pull:", err);
  }
}
