import {
  MenuItem,
  Select,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useState } from "react";
import "./NewRepo.css";
import Navbar from "../Navbar";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../authContext";
import api from "../../Api";
import { useEffect } from "react";

export default function CreateRepository() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [repo, setRepo] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [repoName, setRepoName] = useState("");
  const [description, setDescription] = useState("");
  const [user, setUser] = useState("");
  const [addReadme, setAddReadme] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRepoCreation = async () => {
    setLoading(true);
    if (currentUser) {
      try {
        let res = await api.post("/repo/create", {
          name: repoName,
          description: description,
          visibility: visibility,
          owner: currentUser,
        },
        )

        setRepo(res.data.reposioryID);
        const repoId = res.data.reposioryID;
        if (addReadme) {
          await api.post(
            "/create-file",
            {
              fileName: "README.md",
              content: description || repoName,
              message: "Initial commit",
              repoId
            },
          );
        }
        console.log(repo);
        // navigate(`/repoContent/${repoId}`);
        navigate(`/GitHub/CurrentUser/${localStorage.getItem("userId")}/repo/${repoId}`);

      } catch (err) {
        console.log(err);
      }finally {
            setLoading(false);
      }
    }
  }
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!currentUser) {
        navigate('/auth');
      }
      const res = await api.get(`/userProfile/${localStorage.getItem("userId")}`);
      setUser(res.data);
    }
    fetchCurrentUser();
  }, [currentUser]);
  return (
    <>
      <Navbar userId={currentUser} />
      <div className="container">
        <h2 className="repoCreateHeader">Create a new repository</h2>
        <div className="section">
          <h3 className="repoCreateHeader">1. General</h3>
          <div className="row">
            <div>
              <label className="repoCreateHeader">Owner *</label>
              <div className="dropdown">{user.username}</div>
            </div>
            <div style={{ flex: 1 }}>
              <label className="repoCreateHeader">Repository name *</label>
              <input type="text" onChange={(e) => setRepoName(e.target.value)}
                className="RepoCreateInput" placeholder="Repository name"
                required
              />
            </div>
          </div>
          <label>Description</label>
          <textarea placeholder="0 / 350 characters" defaultValue={""}
            onChange={(e) => setDescription(e.target.value)}
            className="setRepoDescription"
          />
        </div>
        <div className="section">
          <h3 className="repoCreateHeader">2. Configuration</h3>
          <div className="dropdown visibilityDropdown">
            <div id="dropdownTxt">
              <p className="chooseVisibility">Choose visibility *</p>
              <p id="dec">Choose who can see and commit to this repository</p>
            </div>
            <Select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="visibilitySelect"
            >
              <MenuItem value="public">
                <svg aria-hidden="true" focusable="false" className="octicon octicon-repo visibilityIcon" viewBox="0 0 16 16" width={16} height={16} fill="currentColor" display="inline-block" overflow="visible" style={{ verticalAlign: 'text-bottom' }}><path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" /></svg>
                Public
              </MenuItem>
              <MenuItem value="private">
                <svg aria-hidden="true" focusable="false" className="octicon octicon-lock visibilityIcon" viewBox="0 0 16 16" width={16} height={16} fill="currentColor" display="inline-block" overflow="visible" style={{ verticalAlign: 'text-bottom' }}><path d="M4 4a4 4 0 0 1 8 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0 1 12.25 15h-8.5A1.75 1.75 0 0 1 2 13.25v-5.5C2 6.784 2.784 6 3.75 6H4Zm8.25 3.5h-8.5a.25.25 0 0 0-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 0 0 .25-.25v-5.5a.25.25 0 0 0-.25-.25ZM10.5 6V4a2.5 2.5 0 1 0-5 0v2Z" /></svg>
                Private
              </MenuItem>
            </Select>
          </div>
        </div>

        <div className="section">
          <div className="addReadmeBox">
            <div className="readmeText">
              <h4 className="repoCreateHeader">Add README</h4>
              <p className="readmeDescription">
                READMEs can be used as longer descriptions.{" "}
                <a
                  href="https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aboutLink"
                >
                  About READMEs
                </a>
              </p>
            </div>
            <div className="readmeToggle">
              <FormControlLabel
                control={
                  <Switch
                    checked={addReadme}
                    onChange={(e) => setAddReadme(e.target.checked)}
                    color="primary"
                  />
                }
                label={addReadme ? "On" : "Off"}
                labelPlacement="start"
              />
            </div>
          </div>
        </div>
        <button className="button" onClick={handleRepoCreation} disabled={loading}>
          {loading ? "Creating..." : "Create repository"}
          </button>
      </div>
    </>
  );
}
