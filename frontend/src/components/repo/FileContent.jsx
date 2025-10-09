import Prism from "prismjs";
import { diffLines } from "diff";
import { useLocation, useNavigate } from "react-router-dom";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";
import { useState, useEffect } from "react";
import CommitPopupComponent from "../AddFile/commitPopupComponent";
import axios from "axios";
import Editor from "react-simple-code-editor";
import api from "../../Api";

export default function FileContent({
  language,
  fileContent = "",
  oldContent = "",
  newContent = "",
  fileName,
  repoId,
  isDeleting,
  setIsDeleting,
  contentLoading
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(fileContent);
  const [savedContent, setSavedContent] = useState(fileContent);
  const [commitPopup, setCommitPopup] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [extendedDescription, setExtendedDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isImage = fileName.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i);

  useEffect(() => {
    setEditableContent(fileContent);
    setSavedContent(fileContent);
  }, [fileContent]);

  // useEffect(() => {
  //   if (isDeleting) setCommitPopup(true);
  // }, [isDeleting]);

  function handleFileEditing() {
    setIsEditing(true);
  }

  function handleCancel() {
    setEditableContent(savedContent);
    setIsEditing(false);
    setIsDeleting(false);
  }

  const cancelPopup = () => {
    setCommitPopup(false);
    setMessage("");
  };

  const startCommitChanges = () => {
    setCommitPopup(true);
  };

  async function handleCommit() {
    setLoading(true);
    try {
      const commitMessage = (message || `Updated ${fileName}`).trim();

      const res = await api.post(
        "/update/file",
        {
          fileName,
          content: editableContent,
          message: commitMessage,
          repoId,
          extendedDescription: extendedDescription || "",
        }
      );
      setSavedContent(editableContent);
      setIsEditing(false);
      setCommitPopup(false);
      setMessage("");

      navigate(`/fileContent/${repoId}/${res.data.commitId}/file/${fileName}`);
    } catch (err) {
      setErrorMessage("Some error occur during editing file");
      console.error("Failed to commit file:", err);
      alert(
        err?.response?.data?.message ||
        "Failed to commit file. Check console or server logs."
      );
    }finally {
      setLoading(false);
    }
  }
  const handleFileDelete = async () => {
    setLoading(true);
    try {
      await api.delete(`/file/delete`, {
        data: {
          repoId, fileName, message,
          extendedDescription: extendedDescription || ""
        }
      });
      navigate(`/GitHub/CurrentUser/${localStorage.getItem("userId")}/repo/${repoId}`);
    } catch (err) {
      console.error("Error deleting file:", err);
      setErrorMessage("Some error occur during deleting file");
    }finally{
      setLoading(false);
    }
  }
  function normalizeForDiff(str = "") {
    return str
      .replace(/^\uFEFF/, "")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+$/gm, "")
      .replace(/\n$/, "")
  }
  const changes = diffLines(normalizeForDiff(oldContent || ""), normalizeForDiff(newContent || ""));

  const allLines = [];
  changes.forEach((part) => {
    const lines = part.value.split("\n");
    lines.forEach((line, i) => {
      if (line.trim() === "" && i === lines.length - 1) return;
      allLines.push({
        text: line,
        added: part.added,
        removed: part.removed,
      });
    });
  });

  const changedIndexes = allLines
    .map((line, i) => (line.added || line.removed ? i : null))
    .filter((i) => i !== null);

  const firstChanged =
    changedIndexes.length > 0 ? Math.max(changedIndexes[0] - 3, 0) : 0;
  const lastChanged =
    changedIndexes.length > 0
      ? Math.min(changedIndexes[changedIndexes.length - 1] + 3, allLines.length)
      : 0;
  const visibleLines =
    changedIndexes.length > 0 ? allLines.slice(firstChanged, lastChanged + 1) : [];

  return (
    <>
      {location.pathname.startsWith(`/fileContent`) ? (
        loading ? (
          <p>Loading...</p>
        ) : (
          <div className="fileContainer">
          {/* {!isImage && ( */}
          <div className="contentEditSection">
            <span id="editEffect">
              {!isEditing && !isDeleting ? (
                <span className="editText">
                  <p>Edit this file</p>
                </span>
              ) : null}

              {!isEditing && !isDeleting ? (
                <button onClick={handleFileEditing}>
                  <CreateOutlinedIcon sx={{ fill: "#9faab8" }} />
                </button>
              ) : (
                <div className="saveEditbtn">
                  <button id="cancelChangeBtn" onClick={handleCancel}>
                    Cancel changes
                  </button>
                  <button
                    onClick={startCommitChanges}
                    id="commitChanges-btn"
                    disabled={isImage && isEditing}
                    style={{
                      opacity: isImage&&isEditing ? 0.6 : 1,
                      cursor: isImage&&isEditing ? "not-allowed" : "pointer",
                    }}

                  >
                    Commit changes...
                  </button>
                </div>
              )}
            </span>
          </div>
          {commitPopup && (
            <CommitPopupComponent
              fileName={fileName}
              message={message}
              setMessage={setMessage}
              defaultMessage={isEditing ? `Update ${fileName}` : `Delete ${fileName}`}
              errorMessage={errorMessage}
              onCancel={cancelPopup}
              onCommit={isEditing ? handleCommit : handleFileDelete}
              extendedDescription={extendedDescription}
              setExtendedDescription={setExtendedDescription}
              loading={loading}
            />
          )}
          {isImage && (
            <div>
              {!isEditing ? (
                <div className="imageContainer">
                  <img
                    src={savedContent}
                    alt={fileName}
                  />
                </div>
              ) : (
                <div id="notEditableContainer">
                  <div id="muiIconDiv">
                    <CreateOutlinedIcon sx={{ fill: "#9faab8",height: "3rem",width: "20rem",
                  margin: "3rem 0 1rem 0"}} />
                  </div>
                  
                  <h2>Binary file content is not editable.</h2>
                  <p>But you can still delete it.</p>
                </div>
              )}
            </div>
          )}


          {!isImage && (
            <>
              {isEditing ? (
                <pre className="FileContent">
                  <Editor
                    value={editableContent}
                    onValueChange={setEditableContent}
                    highlight={(code) =>
                      Prism.highlight(
                        code,
                        Prism.languages[language] || Prism.languages.markup,
                        language
                      )
                    }
                    className={`language-${language} codes editableContent`}
                  />
                </pre>
              ) : (
                <pre className="FileContent">
                  <code
                    className={`language-${language} codes`}
                    dangerouslySetInnerHTML={{
                      __html: Prism.highlight(
                        savedContent || "// Empty file",
                        Prism.languages[language] || Prism.languages.markup,
                        language
                      ),
                    }}
                  />
                </pre>
              )}
            </>
          )}
        </div>
        )
        
      ) : null}

      {location.pathname.startsWith(`/view`) ? (
        <div className="commitContainer">
          <div className="commitFileName">
            <b>{fileName}</b>
          </div>
          <pre className="fileContent">
            {visibleLines.map((line, i) => {
              const highlighted = Prism.highlight(
                line.text,
                Prism.languages[language] || Prism.languages.markup,
                language
              );

              return (
                <div
                  key={i}
                  className={`diff-line ${line.added ? "line-added" : line.removed ? "line-removed" : "line-normal"
                    }`}
                >
                  <span className="diff-prefix">{line.added ? "+" : line.removed ? "-" : " "}</span>
                  <code
                    className={`language-${language} codeLanguage`}
                    dangerouslySetInnerHTML={{ __html: highlighted }}
                  />
                </div>
              );
            })}
          </pre>
        </div>
      ) : null}
    </>
  );
}
