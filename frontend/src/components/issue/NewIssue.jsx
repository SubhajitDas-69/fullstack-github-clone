import React, { useState } from "react";
import axios from "axios";
import "./NewIssue.css";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar";
import { Avatar } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../Api";
import UserAvatar from "../user/UserAvatar";

const NewIssue = () => {
    const {repoId} = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tab, setTab] = useState("write");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    try {
      const res = await api.post(
        `/issue/${userId}/create/${repoId}`,
        { title, description, userId }
      );
      const newIssueId = res.data.issueId;
      navigate(`/viewIssue/${newIssueId}/repo/${repoId}`);
          
    } catch (err) {
      console.error("Error creating issue:", err);
      alert("Failed to create issue");
    }finally{
      setLoading(false);
    }
  };

  return (
    <div >
        <Navbar repoId={repoId}/>
        <div className="NewIssueHeader">
            <UserAvatar userId={localStorage.getItem("userId")} cssProfileId={"NavProfile"}/>
             <h3>Create new issue</h3>
        </div>
        <div className="new-issue-container">
            <form onSubmit={handleSubmit} className="issue-form">
        <label>Add a title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          required
        />

        <label>Add a description</label>
        <div className="IssueEditor">
          <div className="tabs">
            <button
              type="button"
              className={tab === "write" ? "active" : ""}
              onClick={() => setTab("write")}
            >
              Write
            </button>
            <button
              type="button"
              className={tab === "preview" ? "active" : ""}
              onClick={() => setTab("preview")}
            >
              Preview
            </button>
          </div>

          {tab === "write" ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Type your description here..."
            />
          ) : (
            <div className="preview-box">
              <p>
                {description || "Nothing to preview"}
              </p>
              
            </div>
          )}
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Saving..." : "Submit new issue"}
        </button>
      </form>
        </div>
      
    </div>
  );
};

export default NewIssue;
