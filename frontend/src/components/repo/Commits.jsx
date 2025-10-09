import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-java";
import FileContent from "./FileContent";
import Navbar from "../Navbar";
import './Commits.css';
import { Avatar } from "@mui/material";
import { useRef } from "react";
import UserAvatar from "../user/UserAvatar";
import api from "../../Api";

export default function Commits() {
  const [repo, setRepo] = useState(null);
  const { commitId, repoName, repoId } = useParams();
  const [commits, setCommits] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

     const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const res = await api.get(
          `/repo/${repoId}/commits/${commitId}`
        );
        setCommits(res.data);

      } catch (err) {
        console.error(err);
      }
    };
    fetchCommits();
  }, [commitId]);

  useEffect(() => {
    const fetchRepository = async () => {
      if (!repoName) return;
      try {
        const response = await api.get(`/repo/name/${repoName}`);
        setRepo(response.data);
        console.log(repo);

      } catch (err) {
        console.error("Cannot fetch repo details: ", err);
      }
    };
    fetchRepository();
  }, [repoName]);

  function getLanguage(fileName) {
    if (fileName.endsWith(".js")) return "javascript";
    if (fileName.endsWith(".css")) return "css";
    if (fileName.endsWith(".html")) return "markup";
    if (fileName.endsWith(".jsx")) return "jsx";
    if (fileName.endsWith(".java")) return "java";
    return "markup";
  }
  const fileRefs = useRef({});

  const handleFileClick = (fileName) => {
    const el = fileRefs.current[fileName];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  useEffect(() => {
    if (!commits) return;
    if (searchQuery.trim() === "") {
      setSearchResults(commits);
    } else {
      const filteredCommits = commits.filter(
        (item) =>
          item?.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredCommits);
      console.log(filteredCommits);

    }
  }, [searchQuery, commits]);

  return (
    <>
      <Navbar repoId={repoId} repoName={repoName} commitId={commitId} />
      <div id="commitHeader">
        <h2>Commit <span>{commitId}</span></h2>
        <div id="userDiv">
          <UserAvatar username={repo?.owner?.username} cssProfileId={"NavProfile"} />
          <b>{repo?.owner?.username}</b>
          <p>{commits?.date}</p>
        </div>
        <div id="commitMessage">
          <b>{commits[0]?.message}</b>
          {commits[0]?.extendedDescription != "" &&
            <p>{commits[0]?.extendedDescription}</p>
          }
        </div>

      </div>
      <div className="main commitsMain">
        <div id="fileContent" className={`commitList fileViewer ${isSidebarOpen ? "show" : "hide"}`}>
           <button onClick={handleSidebarToggle} id="toggleSidebarBtn">
              <svg aria-hidden="true" focusable="false" className="octicon octicon-sidebar-collapse" viewBox="0 0 16 16" width={16} height={16} fill="currentColor" display="inline-block" overflow="visible" style={{verticalAlign: 'text-bottom'}}><path d="M6.823 7.823a.25.25 0 0 1 0 .354l-2.396 2.396A.25.25 0 0 1 4 10.396V5.604a.25.25 0 0 1 .427-.177Z" /><path d="M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0ZM1.5 1.75v12.5c0 .138.112.25.25.25H9.5v-13H1.75a.25.25 0 0 0-.25.25ZM11 14.5h3.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H11Z" /></svg>
            </button>
          <input type="text" placeholder="Filter files..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="searchFileOnCommits"/>
          <div id="files" className="AllFile">
            <div>
              {searchResults.map((file) => (
                <div key={file.oldCommitId} className="trMain file">
                  <div className="tbData">
                    <div className="fileList" onClick={() => handleFileClick(file.fileName)}>
                     {file?.fileState !== "deleted" ? (
                       <svg aria-hidden="true" focusable="false" className="octicon octicon-file-diff fgColor-muted" viewBox="0 0 16 16" width={16} height={16} fill="currentColor" display="inline-block" overflow="visible" style={{ verticalAlign: 'text-bottom', color: 'green' }}><path d="M1 1.75C1 .784 1.784 0 2.75 0h7.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177l-2.914-2.914a.25.25 0 0 0-.177-.073ZM8 3.25a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0V7h-1.5a.75.75 0 0 1 0-1.5h1.5V4A.75.75 0 0 1 8 3.25Zm-3 8a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Z" id="commitFileLogo" /></svg>
                     ): (
                      <svg aria-hidden="true" focusable="false" className="octicon octicon-file-removed fgColor-danger" viewBox="0 0 16 16" width={16} height={16} fill="currentColor" display="inline-block" overflow="visible" style={{verticalAlign: 'text-bottom'}}><path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V4.664a.25.25 0 0 0-.073-.177l-2.914-2.914a.25.25 0 0 0-.177-.073Zm4.5 6h2.242a.75.75 0 0 1 0 1.5h-2.24l-2.254.015a.75.75 0 0 1-.01-1.5Z" fill="red"/></svg>

                     )}
                     
                      {file.fileName}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="commitContents">
          <div className="sidebarHeader">
            <button onClick={handleSidebarToggle} id="toggleSidebarBtn">
              <svg aria-hidden="true" focusable="false" className="octicon octicon-sidebar-collapse" viewBox="0 0 16 16" width={16} height={16} fill="currentColor" display="inline-block" overflow="visible" style={{verticalAlign: 'text-bottom'}}><path d="M6.823 7.823a.25.25 0 0 1 0 .354l-2.396 2.396A.25.25 0 0 1 4 10.396V5.604a.25.25 0 0 1 .427-.177Z" /><path d="M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0ZM1.5 1.75v12.5c0 .138.112.25.25.25H9.5v-13H1.75a.25.25 0 0 0-.25.25ZM11 14.5h3.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H11Z" /></svg>
            </button>
          <h3>{commits.length} file changed</h3>
          </div>
          
          {commits.map((c) => (
            <div key={c.oldCommitId || c.fileName}
              ref={(el) => { fileRefs.current[c.fileName] = el; }}>
              {c.isImage ? (
                <div className="commitContainer">
                  <div className="commitFileName">
                    <b>{c.fileName}</b>
                  </div>
                  <div className="fileContent imageContainer">
                    <img
                    src={c.newContent}
                    alt={c.fileName}
                  />
                  </div>
                  
                </div>
              ) : (
                <FileContent
                  language={getLanguage(c.fileName)}
                  oldContent={c.oldContent || ""}
                  newContent={c.newContent || ""}
                  fileName={c.fileName}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
