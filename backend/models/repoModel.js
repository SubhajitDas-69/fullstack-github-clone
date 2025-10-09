import mongoose from "mongoose";
import { Schema } from "mongoose";
import Issue from "./issueModel.js";
import IssueActivity from "./issueActivityModel.js";
import User from "./userModel.js";

const RepositorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    content: [
        {
            commitId: { type: String },
            fileName: { type: String },
            message: { type: String },
            date: { type: Date },
            hash: { type: String }
        }
    ],
    visibility: {
        type: String,
        num: ["public", "private"],
        default: "public"
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    openedIssues: [
        {
            type: Schema.Types.ObjectId,
            ref: "Issue"
        },
    ],
    closedIssues: [
        {
            type: Schema.Types.ObjectId,
            ref: "Issue"
        },
    ],
    stars: {
        type: Number,
        default: 0
    },
    starredBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    commitChanges: [
        {
            commitId: { type: String },
            message: { type: String },
            extendedDescription: { type: String },
            date: { type: Date, default: Date.now },
            commits: [
                {
                    fileName: { type: String },
                    // message: { type: String },
                    oldCommitId: { type: String },
                    newCommitId: { type: String },
                    fileState: { 
                        type: String, 
                        enum: ["added", "modified", "deleted"], 
                        default: "added"
                    }
                }
            ]
        }
    ]
});

RepositorySchema.pre("findOneAndDelete", async function (next) {
  const repo = await this.model.findOne(this.getFilter());

  if (repo) {
    const allIssues = [...repo.openedIssues, ...repo.closedIssues];
    await Issue.deleteMany({ _id: { $in: allIssues } });

    await IssueActivity.deleteMany({ issue: { $in: allIssues } });

    await User.updateMany(
      { repositories: repo._id },
      { $pull: { repositories: repo._id } }
    );
    await User.updateMany(
      { starRepos: repo._id },
      { $pull: { starRepos: repo._id } }
    );
  }

  next();
});

const Repository = mongoose.model("Repository", RepositorySchema);
export default Repository;