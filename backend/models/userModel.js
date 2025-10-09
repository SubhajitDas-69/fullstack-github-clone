import mongoose from "mongoose";
import { Schema } from "mongoose";
import Repository from "./repoModel.js";
import Issue from "./issueModel.js";
import IssueActivity from "./issueActivityModel.js";

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    bio: {
        type: String,
    },
    company: {
        type: String
    },
    password: {
        type: String
    },
    repositories: [
        {
            type: Schema.Types.ObjectId,
            ref: "Repository",
            default: []
        }
    ],
    starRepos: [
        {
            default: [],
            type: Schema.Types.ObjectId,
            ref: "Repository"
        }
    ],
    followers: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    following: [
        {
            type: Schema.Types.ObjectId,
            ref: "User",
        }
    ]
});

UserSchema.pre("findOneAndDelete", async function (next) {
  const user = await this.model.findOne(this.getFilter());
  if (!user) return next();
  try {
    const userRepos = await Repository.find({ owner: user._id });

    for (const repo of userRepos) {
       await Repository.findOneAndDelete({ _id: repo._id });
    }
    // const userIssues = await Issue.find({
    //   $or: [{ openedBy: user._id }, { closedBy: user._id }],
    // });
    // const issueIds = userIssues.map((i) => i._id);

    // await IssueActivity.deleteMany({ issue: { $in: issueIds } });
    // await Issue.deleteMany({ _id: { $in: issueIds } });

    await mongoose.model("User").updateMany(
      { followers: user._id },
      { $pull: { followers: user._id } }
    );
    await mongoose.model("User").updateMany(
      { following: user._id },
      { $pull: { following: user._id } }
    );

    next();
  } catch (err) {
    console.error("Error cascading delete for user:", err);
  }
});

const User = mongoose.model("User", UserSchema);

export default User;
