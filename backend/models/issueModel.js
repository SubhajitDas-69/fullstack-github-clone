import mongoose from "mongoose";
import { Schema } from "mongoose";

const IssueSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["open", "closed"],
        defalult: "open"
    },
    repository: {
        type: Schema.Types.ObjectId,
        ref: "Repository",
        required: true,
    },
    openedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    closedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    issueActivities: [
    {
      type: Schema.Types.ObjectId,
      ref: "IssueActivity",
    },
  ],
});

const Issue = mongoose.model("Issue", IssueSchema);
export default Issue;