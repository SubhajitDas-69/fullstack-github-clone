import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./CommitViewer.css";
import Navbar from "../Navbar";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-java";

import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import SearchFile from "./SearchFile";
import FileContent from "./FileContent";
import UserAvatar from "../user/UserAvatar";
import api from "../../Api";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function CommitViewer() {
  const { repoId, commitId, fileName } = useParams();

  const [repo, setRepo] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [language, setLanguage] = useState("markup");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDeleteFile, setDeleteFile] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const fetchRepository = async () => {
      if (!repoId) return;
      try {
        const response = await api.get(`/repo/${repoId}`);
        setRepo(response.data);
      } catch (err) {
        console.error("Cannot fetch repo details: ", err);
      }
    };
    fetchRepository();
  }, [repoId, commitId]);

  useEffect(() => {
    setLoading(true);
    const fetchFile = async () => {
      if (!commitId || !fileName) return;
      try {
        if (fileName.match(/\.(png|jpg|jpeg|gif)$/i)) {
          const res = await api.get(
            `/repo/${repoId}/commit/${commitId}/file/${encodeURIComponent(fileName)}`,
            { responseType: "blob" }
          );
          const url = URL.createObjectURL(res.data);
          setFileContent(url);
        } else {
          const res = await api.get(
            `/repo/${repoId}/commit/${commitId}/file/${encodeURIComponent(fileName)}`
          );
          setFileContent(res.data.content);
        }

        if (fileName.endsWith(".js")) setLanguage("javascript");
        else if (fileName.endsWith(".css")) setLanguage("css");
        else if (fileName.endsWith(".html")) setLanguage("markup");
        else if (fileName.endsWith(".jsx")) setLanguage("jsx");
        else if (fileName.endsWith(".java")) setLanguage("java");
        else setLanguage("markup");
      } catch (err) {
        console.error("Error fetching file content", err);
      }finally{
        setLoading(false);
      }
    };
    fetchFile();
  }, [commitId, fileName]);

  if (!repo) {
    return <p className="p-4">Repository not found.</p>;
  }

  return (
    <>
      <Navbar username={repo?.owner?.username} repoName={repo?.name} repoId={repoId} fileName={fileName} commitId={commitId} />

      <div className="main viewer pageResponsive">
        <div id="fileContent" className={`fileViewer ${isSidebarOpen ? "show" : "hide"}`} >
          <div className="sidebarHeader">
            <button onClick={handleSidebarToggle} id="toggleSidebarBtn">
              <svg aria-hidden="true" focusable="false" className="octicon octicon-sidebar-collapse" viewBox="0 0 16 16" width={16} height={16} fill="currentColor" display="inline-block" overflow="visible" style={{ verticalAlign: 'text-bottom' }}><path d="M6.823 7.823a.25.25 0 0 1 0 .354l-2.396 2.396A.25.25 0 0 1 4 10.396V5.604a.25.25 0 0 1 .427-.177Z" /><path d="M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0ZM1.5 1.75v12.5c0 .138.112.25.25.25H9.5v-13H1.75a.25.25 0 0 0-.25.25ZM11 14.5h3.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H11Z" /></svg>
            </button>
            <h3 id="fileTitle">Files</h3>
          </div>

          <SearchFile Repository={repo} cssClassName={"searchFiles"} />
          <div id="files" className="AllFile">
            {repo.content?.map((item) => (
              <div key={item._id} className="trMain file">
                <div className="tbData">
                  <div className="fileList">
                    <InsertDriveFileOutlinedIcon sx={{ fontSize: 20, fill: "#d0d0d0" }} />
                    <Link
                      to={`/fileContent/${repoId}/${item.commitId}/file/${item.fileName}`}
                      className="fileLink"
                    >
                      {item.fileName}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="Content">
          <div className="repoHeader header newHeader">
            <button onClick={handleSidebarToggle}>
              <svg aria-hidden="true" focusable="false" className="octicon octicon-sidebar-collapse" viewBox="0 0 16 16" width={16} height={16} fill="currentColor" display="inline-block" overflow="visible" style={{ verticalAlign: 'text-bottom' }}><path d="M6.823 7.823a.25.25 0 0 1 0 .354l-2.396 2.396A.25.25 0 0 1 4 10.396V5.604a.25.25 0 0 1 .427-.177Z" /><path d="M1.75 0h12.5C15.216 0 16 .784 16 1.75v12.5A1.75 1.75 0 0 1 14.25 16H1.75A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0ZM1.5 1.75v12.5c0 .138.112.25.25.25H9.5v-13H1.75a.25.25 0 0 0-.25.25ZM11 14.5h3.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25H11Z" /></svg>
            </button>
            <h2 className="repoName">
              <Link to={`/GitHub/CurrentUser/${localStorage.getItem("userId")}/repo/${repo._id}`} className="repoLink">
                {repo.name}
              </Link> / {fileName}</h2>
            <div id="deleteFileBtn" onClick={() => setDeleteFile((prev) => !prev)}>
              <MoreHorizIcon sx={{ fontSize: 20, color: "gray" }} />
            </div>
          </div>
          {isDeleteFile && (
            <div id="deleteFileContainer" onClick={()=> {
            setIsDeleting(true);
            setDeleteFile(false);
            }}>
              <b>Delete file</b>
            </div>
          )}
          <div className="contentHeader">
            <UserAvatar username={repo?.owner?.username} cssProfileId={"profile"} />
            {repo?.owner?.username}
          </div>
          <FileContent language={language} fileContent={fileContent} repoId={repo._id} fileName={fileName} isDeleting={isDeleting} setIsDeleting={setIsDeleting} contentLoading={loading}/>
        </div>
      </div>
    </>
  );
}
