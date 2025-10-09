import { useState } from "react";
import "./CreateFile.css";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import axios from "axios";
import CommitPopup from "./commitPopupComponent";
import api from "../../Api.js";

export default function CreateFile() {
  const navigate = useNavigate();
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [commitPopup, setCommitPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [tab, setTab] = useState("edit");
  const [extendedDescription, setExtendedDescription] = useState("");
  const { repoId } = useParams();

  const startCommitChanges = () => {
    setErrorMessage("");
    setCommitPopup(true);
  };

  const handleCommit = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("You must be logged in to commit.");
        return;
      }

      const commitMessage = message.trim() || `Create ${fileName}`;
      const res = await api.post(
        "/create-file",
        {
          fileName,
          content: fileContent,
          message: commitMessage,
          repoId,
          extendedDescription: extendedDescription || "",
        },
      );

      if (res.data.success === false) {
        setErrorMessage(res.data.message);
        return;
      }

      alert(`File "${fileName}" created on server!`);
      setCommitPopup(false);
      navigate(`/GitHub/CurrentUser/${localStorage.getItem("userId")}/repo/${repoId}`);
    } catch (err) {
      if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
      console.error(err);
    }
  };

  const cancelPopup = () => {
    setCommitPopup(false);
    setErrorMessage("");
  };

  const cancelCommit = () => {
    navigate(`/GitHub/CurrentUser/${localStorage.getItem("userId")}/repo/${repoId}`);
  };

  return (
    <>
      <Navbar userId={localStorage.getItem("userId")} />
      <div className="EditorContainer">
        <div className="Fileheader createFileHeader">
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="file-input"
            placeholder="Name your file..."
          />
          <div className="actions">
            <button className="cancel-btn" onClick={cancelCommit}>
              Cancel changes
            </button>
            <button
              className="commit-btn"
              onClick={startCommitChanges}
              disabled={!fileName.trim()}
            >
              Commit changes…
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            type="button"
            className={tab === "edit" ? "active" : ""}
            onClick={() => setTab("edit")}
          >
            Edit
          </button>
          <button
            type="button"
            className={tab === "preview" ? "active" : ""}
            onClick={() => setTab("preview")}
          >
            Preview
          </button>
        </div>
        {tab === "edit" ? (
          <textarea
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
            className="editor"
            placeholder="// Enter file contents here"
          />
        ) : (
          <div className="preview">
            <pre>
              {fileContent || "Nothing to preview"}
            </pre>
          </div>
        )}

        {/* Code editor */}
        {/* <textarea
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          className="editor"
          placeholder="// Enter file contents here"
        /> */}

        {/* Popup */}
        {commitPopup && (
          <CommitPopup
            fileName={fileName}
            message={message}
            setMessage={setMessage}
            defaultMessage={`Create ${fileName}`}
            errorMessage={errorMessage}
            onCancel={cancelPopup}
            onCommit={handleCommit}
            extendedDescription={extendedDescription}
            setExtendedDescription={setExtendedDescription}
          />
        )}
      </div>
    </>
  );
}
