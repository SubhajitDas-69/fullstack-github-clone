import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "../models/userModel.js";
import { s3, S3_BUCKET } from "../config/aws-config.js";
import Repository from "../models/repoModel.js";

dotenv.config();

export const signup = async (req, res) => {
    const { username, password, email, bio, company } = req.body;
    try {

        const user = await User.findOne({ $or: [{ username }, { email }] });
        if (user) {
            return res.status(400).json({ message: "User already exists!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            bio,
            company,
            repositories: [],
            starRepos: [],
            followers: [],
            following: []
        });
        const result = await newUser.save();

        const token = jwt.sign({ id: result._id }, process.env.JWT_SECRET_KEY, { expiresIn: "2h" });
        res.json({ token, userId: result._id });
    } catch (err) {
        console.error("Error during signup: ", err.message);
        res.status(500).send("Server error");
    }

};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials!" });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });
        res.json({ token, userId: user._id });
    } catch (err) {
        console.error("Error during login: ", err.message);
        res.status(500).send("Server error");
    };
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        console.error("Error during fetching: ", err.message);
        res.status(500).send("Server error");
    }
};

export const getUserProfile = async (req, res) => {
    const currentID = req.params.id;
    try {
        const user = await User.findById(currentID)
            .populate({
                path: "starRepos",
                populate: {
                    path: "owner",
                    select: "username",
                },
            });
        if (!user) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.json(user);
    } catch (err) {
        console.error("Error during fetching: ", err.message);
        res.status(500).send("Server error");
    }

};

export const updateUserProfile = async (req, res) => {
    const currentID = req.params.id;
    const { username, bio, company } = req.body;

    try {
        const updateFields = { username, bio, company };
        // if (password) {
        //   const salt = await bcrypt.genSalt(10);
        //   updateFields.password = await bcrypt.hash(password, salt);
        // }

        const updatedUser = await User.findByIdAndUpdate(
            currentID,
            { $set: updateFields },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found!" });
        }
        res.json(updatedUser);
    } catch (err) {
        console.error("Error updating user: ", err.message);
        res.status(500).send("Server error");
    }
};

export const deleteUserProfile = async (req, res) => {
  const currentID = req.params.id;
  try {
    const user = await User.findById(currentID);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    const repos = await Repository.find({ owner: currentID });

    for (const repo of repos) {
      const repoId = repo._id.toString();

      try {
        let continuationToken = null;
        let allKeys = [];

        do {
          const listParams = {
            Bucket: S3_BUCKET,
            Prefix: `${repoId}/`,
            ContinuationToken: continuationToken || undefined,
          };

          const listedObjects = await s3.listObjectsV2(listParams).promise();

          if (listedObjects.Contents.length > 0) {
            const keys = listedObjects.Contents.map((obj) => ({ Key: obj.Key }));
            allKeys.push(...keys);

            while (allKeys.length > 0) {
              const batch = allKeys.splice(0, 1000);
              await s3
                .deleteObjects({
                  Bucket: S3_BUCKET,
                  Delete: { Objects: batch, Quiet: true },
                })
                .promise();
            }

            console.log(`Deleted ${listedObjects.Contents.length} objects from repo ${repoId}`);
          }

          continuationToken = listedObjects.IsTruncated
            ? listedObjects.NextContinuationToken
            : null;
        } while (continuationToken);
      } catch (err) {
        console.error(`Error deleting S3 objects for repo ${repoId}:`, err);
      }
    }
    await User.findByIdAndDelete(currentID);

    res.json({ message: "User, repositories, issues, activities, and AWS files deleted!" });
  } catch (err) {
    console.error("Error deleting user: ", err.message);
    res.status(500).send("Server error");
  }
};

export const followUser = async (req, res) => {
    try {
        const userId = req.userId;
        const targetId = req.params.id;

        if (userId === targetId) {
            return res.status(400).json({ message: "You can't follow yourself" });
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetId);

        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.following.includes(targetId)) {
            user.following.push(targetId);
            targetUser.followers.push(userId);

            await user.save();
            await targetUser.save();

            return res.json({ message: "User followed successfully" });
        } else {
            return res.status(400).json({ message: "Already following this user" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const unfollowUser = async (req, res) => {
    try {
        const userId = req.userId;
        const targetId = req.params.id;

        if (userId === targetId) {
            return res.status(400).json({ message: "You can't unfollow yourself" });
        }

        const user = await User.findById(userId);
        const targetUser = await User.findById(targetId);

        if (!user || !targetUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.following.includes(targetId)) {
            user.following = user.following.filter((id) => id.toString() !== targetId);
            targetUser.followers = targetUser.followers.filter((id) => id.toString() !== userId);

            await user.save();
            await targetUser.save();

            return res.json({ message: "User unfollowed successfully" });
        } else {
            return res.status(400).json({ message: "You are not following this user" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const getFollowers = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).populate("followers");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user.followers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

export const getFollowing = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id).populate("following");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user.following);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
