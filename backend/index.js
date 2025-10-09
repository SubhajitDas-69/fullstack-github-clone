import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import mainRouter from "./routes/main.router.js";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { initRepo } from "./controllers/init.js";
import { addRepo } from "./controllers/add.js";
import { commitRepo } from "./controllers/commit.js";
import { pushRepo } from "./controllers/push.js";
import { pullRepo } from "./controllers/pull.js";
import { revertRepo } from "./controllers/revert.js";

dotenv.config();

const atlasURL = process.env.ATLASDB_URL;

async function connectDB() {
  await mongoose.connect(atlasURL);
  console.log("MongoDB connected");
}

yargs(hideBin(process.argv))
  .command("start", "Starts a new server", {}, startServer)
  .command("init", "Initialise a new repository", {}, async () => {
    await connectDB();
    await initRepo();
  })
  .command(
    "add <file>",
    "Add file to the repository",
    (yargs) => {
      yargs.positional("file", {
        describe: "File to add to the staging area",
        type: "string",
      });
    },
    async (argv) => {
      await connectDB();
      await addRepo(argv.file);
    }
  )
  .command(
    "commit <message>",
    "Commit the staged files",
    (yargs) => {
      yargs.positional("message", {
        describe: "Commit message",
        type: "string",
      });
    },
    async (argv) => {
      await connectDB();
      await commitRepo(argv.message);
    }
  )
  .command("pull <repoId>", 
    "Pull commits from S3",
    (yargs) =>{
      yargs.positional("repoId", {
        describe: "The repository ID in MongoDB",
        type: "string",
      });
    },
    async (argv) => {
    await connectDB();
    try{
      await pullRepo(argv.repoId);
      console.log("Pull successful!");
    }catch(err){
      console.error("Pull failed :", err.message);
    }
  })
  .command(
    "push <url>",
    "Push commits to S3",
    (yargs) => {
      yargs.positional("repoId", {
        describe: "The repository ID in MongoDB",
        type: "string",
      });
    },
    async (argv) => {
      try {
        await connectDB();
        let res = await pushRepo(argv.url);
        console.log("Push successful!");        
      } catch (err) {
        console.error("Push failed:", err.message);
      }
    }
  )
  .command(
    "revert <commitID>",
    "Revert to a specific commit",
    (yargs) => {
      yargs.positional("commitID", {
        describe: "Commit ID to revert",
        type: "string",
      });
    },
    async (argv) => {
      await connectDB();
      await revertRepo(argv.commitID);
    }
  )
  .demandCommand(1, "You need at least one command")
  .help().argv;

function startServer() {
  const app = express();
  const port = process.env.PORT;

  app.use(express.json());
  app.use(cors({ origin: "*" }));

  mongoose
    .connect(atlasURL)
    .then(() => console.log("MongoDB connected!"))
    .catch((err) => console.error("Unable to connect:", err));

  app.use("/",mainRouter);

  app.listen(port, () =>{
    console.log(`Server is listining on port ${port}`);
});
}
