
import mongoose, { Schema } from "mongoose";

const IssueActivitySchema = new Schema(
  {
    issue: { type: Schema.Types.ObjectId, ref: "Issue", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: {
      type: String,
      enum: ["updated", "closed", "reopened", "add commit", "comments"],
      required: true,
    },
    details: { type: String },
    commitId: {type: String},
    comments: {type: String},
  },
  { timestamps: true }
);

const IssueActivity = mongoose.model("IssueActivity", IssueActivitySchema);
export default IssueActivity;
