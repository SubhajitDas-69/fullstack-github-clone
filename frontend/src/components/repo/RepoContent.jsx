import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../Navbar";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import "./RepoContent.css";
import LangPercentageGenerator from "./LangPercentageGenerator";
import SearchFile from "./SearchFile";
import StarButton from "./StarButton";
import UserAvatar from "../user/UserAvatar";
import api from "../../Api";
import timeAgo from "../timeAgo";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import CreateOutlinedIcon from "@mui/icons-material/CreateOutlined";

export default function RepoContent() {
  const userId = localStorage.getItem("userId");
  const { repoId } = useParams();
  const [repo, setRepo] = useState(null);
  const [issues, setIssues] = useState([]);
  const [readmeContent, setReadmeContent] = useState("");
  const [readmeFile, setReadmeFile] = useState(null);

  useEffect(() => {
    const fetchRepoContent = async () => {
      if (!repoId) return;
      try {
        const response = await api.get(`/repo/${repoId}`);
        setRepo(response.data);
      } catch (err) {
        console.error("Cannot fetch repo details: ", err);
      }
    };
    fetchRepoContent();
  }, [repoId]);


  useEffect(() => {
    if (repo?.content) {
      const ownerId = repo?.owner?._id;
      const extractedIssues = repo.content
        .map((item) => {
          if (!item?.message) return null;
          const match = item.message.match(/#([a-f0-9]{24})/i);
          if (!match) return null;

          const issueId = match[1];
          const commitMessage = item.message.replace(match[0], "").trim();

          return { issueId, message: commitMessage, commitId: item.commitId, repoOwner: ownerId };
        })
        .filter(Boolean);
      setIssues(extractedIssues);
    }
  }, [repo]);


  useEffect(() => {
    const createIssueRef = async () => {
      if (issues.length === 0) return;

      try {
        await api.post(
          `/issues/check-issue/${repoId}`,
          { issues }
        );
      } catch (err) {
        console.error("Error sending issues: ", err);
      }
    };
    createIssueRef();
  }, [repoId, issues]);


  useEffect(() => {
    if (repo?.content) {
      const found = repo.content.find(
        (item) => item.fileName?.toLowerCase() === "readme.md"
      );
      setReadmeFile(found);
    }
  }, [repo]);

  useEffect(() => {
    const fetchReadme = async () => {
      if (!readmeFile) return;
      try {
        const res = await api.get(
          `/repo/${repoId}/commit/${readmeFile.commitId}/file/${encodeURIComponent(
            readmeFile.fileName
          )}`
        );
        setReadmeContent(res.data.content);
      } catch (err) {
        console.error("Error fetching README content:", err);
      }
    };
    fetchReadme();
  }, [readmeFile, repoId]);

  if (!repo || !userId) {
    return <p>Loading...</p>;
  }
  return (
    <>
      <Navbar
        username={repo.owner.username}
        repoName={repo.name}
        repoId={repoId}
      // userId={userId}
      />

      <div>
        <div className="repoHeader headerResponsive">
          <div id="repoProfile">
            <UserAvatar username={repo?.owner?.username} cssProfileId={"profile"} />
            <h3>{repo.name}</h3>
            <b id="repoVisibility">{repo.visibility}</b>
          </div>
          <div>
            <StarButton repo={repo} />
          </div>
        </div>

        {repo.content.length !== 0 || repo.commitChanges?.length !== 0 ? (
          <div className="main appContent">
            <div id="fileContent">
              <div className="fileSearch">
                <SearchFile Repository={repo} cssClassName={"searchContainer"} />
                <Link to={`/repo/${repoId}/file/createFile`}>
                  <button id="addFilebtn">Add file</button>
                </Link>
              </div>

              <div id="commitsNumber">
                <Link to={`commits`}>
                  <div>
                    <svg aria-hidden="true" focusable="false" className="octicon octicon-history" viewBox="0 0 16 16" width={16} height={16} fill="currentColor" display="inline-block" overflow="visible" style={{ verticalAlign: 'text-bottom' }}><path d="m.427 1.927 1.215 1.215a8.002 8.002 0 1 1-1.6 5.685.75.75 0 1 1 1.493-.154 6.5 6.5 0 1 0 1.18-4.458l1.358 1.358A.25.25 0 0 1 3.896 6H.25A.25.25 0 0 1 0 5.75V2.104a.25.25 0 0 1 .427-.177ZM7.75 4a.75.75 0 0 1 .75.75v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5A.75.75 0 0 1 7.75 4Z"
                      fill="#b6b7b9"
                    /></svg>
                    <p><span>{repo.commitChanges.length}</span>Commits</p>
                  </div>
                </Link>

              </div>
              <table id="files">

                <thead>
                  <tr className="tr">
                    <th>Name</th>
                    <th>Last commit message</th>
                    <th>Last commit date</th>
                  </tr>
                </thead>
                <tbody>
                  {repo.content
                    .filter((item) => item && item.fileName)
                    .map((item, index) => {
                      let message = item.message || "No commit message";
                      let issueId = null;
                      let issueRef = null;
                      let isValidIssue = false;

                      const match = message.match(/#([a-f0-9]{24})/i);
                      if (match) {
                        issueRef = match[0];
                        issueId = issueRef.slice(1);

                        if (
                          (repo.openedIssues && repo.openedIssues.some((issue) => issue._id.toString() === issueId)) ||
                          (repo.closedIssues && repo.closedIssues.some((issue) => issue._id.toString() === issueId))
                        ) {
                          isValidIssue = true;
                        }

                        message = message.replace(match[0], "").trim();
                      }

                      return (
                        <tr key={index} className="trMain">
                          <td className="tbData">
                            <div className="fileList">
                              <InsertDriveFileOutlinedIcon
                                sx={{ fontSize: 20, fill: "#d0d0d0" }}
                              />
                              <Link
                                to={`/fileContent/${repoId}/${item.commitId}/file/${item.fileName}`}
                                className="fileLink"
                              >
                                {item.fileName}
                              </Link>
                            </div>
                          </td>
                          <td className="tbData">
                            <Link
                              to={`/view/${repo.name}/${repoId}/allCommits/${item.commitId}`}
                            >
                              {message}
                            </Link>
                            {issueRef && (
                              <span style={{ marginLeft: "8px" }}>
                                {isValidIssue ? (
                                  <div id="isIssueRef">
                                    <Link to={`/viewIssue/${issueId}/repo/${repoId}`}>
                                      {issueRef}
                                    </Link>
                                  </div>
                                ) : (
                                  <Link
                                    to={`/view/${repo.name}/${repoId}/allCommits/${item.commitId}`}
                                  >
                                    {issueRef}
                                  </Link>
                                )}
                              </span>
                            )}
                          </td>
                          <td className="tbData">
                            {item.date
                              ? timeAgo(new Date(item.date))
                              : "Unknown date"}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {readmeFile ? (
                <div className="readmeContainer">
                  <div id="readmeHeader">
                    <div id="readmeHeaderPart1">
                      <svg aria-hidden="true" focusable="false" className="octicon octicon-book" viewBox="0 0 16 16" width={16} height={16} fill="currentColor" display="inline-block" overflow="visible" style={{ verticalAlign: 'text-bottom' }}><path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z" /></svg>

                    <b className="readmeTitle">README</b>
                    </div>
                    
                    <div>
                      <Link to={`/fileContent/${repoId}/${readmeFile?.commitId}/file/${readmeFile?.fileName}`}>
                      <button>
                        <CreateOutlinedIcon sx={{ fill: "#9faab8" }} />
                      </button>
                      </Link>
                    </div>
                  </div>

                  <div className="readmeContent">
                    <p>{readmeContent}</p>
                  </div>
                </div>

              ): (
                <div className="readmeContainer">
                  <div id="readmeHeader">
                    <div id="readmeHeaderPart1">
                      <svg aria-hidden="true" focusable="false" className="octicon octicon-book" viewBox="0 0 16 16" width={16} height={16} fill="currentColor" display="inline-block" overflow="visible" style={{ verticalAlign: 'text-bottom' }}><path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z" /></svg>

                    <b className="readmeTitle">README</b>
                    </div>
                  </div>

                  <div className="readmeContent readmeAdd">
                    <svg aria-hidden="true" focusable="false" className="octicon octicon-book" viewBox="0 0 16 16" width={40} height={40} fill="currentColor" display="inline-block" overflow="visible" style={{ verticalAlign: 'text-bottom' }}><path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z" fill="gray"/></svg>
                    <h3>Add a README</h3>
                    <p>Help people interested in this repository understand your project by adding a README.</p>
                    <Link to={`/repo/${repoId}/file/createFile`}>
                    <button className="comment-btn">Add a README</button>
                    </Link>
                    
                  </div>
                </div>
              )}
            </div>


            <div id="repoAbout">
              <h3 id="aboutText">About</h3>
              {repo.description ? (
                <p>{repo.description}</p>
              ) : (
                <p>No description, website, or topics provided.</p>
              )}
              <div id="repoStarsContainer">
                {repo.stars != 0 ? (
                  <div id="noOfRepoStar" className="starCountContainer">
                    <StarBorderIcon className="starBorder" /> <span>{repo.stars} <b>star</b></span>

                  </div>
                ) : (
                  null
                )}
              </div>
              <hr />
              <LangPercentageGenerator content={repo.content} />
            </div>
          </div>
        ) : (
          <div className="gitHubCommandDiv">
            <div id="githubInitialCommand">
              <div id="createFile">
                <h2>Quick setup — if you’ve done this kind of thing before</h2>
                <p>Get started by </p>
                <Link to={`/repo/${repoId}/file/createFile`} className="createFileLink">
                  creating a new file
                </Link>
              </div>
              <h2>...or push files to the newly created repository from the command line</h2>
              <ul>
                <li>node index.js init</li>
                <li>node index.js add "fileName"</li>
                <li>node index.js commit "first commit"</li>
                <li>{`node index.js push "http://localhost:5173/GitHub/CurrentUser/${localStorage.getItem("userId")}/repo/${repoId}"`}</li>
              </ul>
              <hr />
              <h2 id="Userguide">…or push an existing repository from the command line</h2>
              <ul>
                <li>node index.js add "fileName"</li>
                <li>node index.js commit "first commit"</li>
                <li>{`node index.js push "http://localhost:5173/GitHub/CurrentUser/${localStorage.getItem("userId")}/repo/${repoId}"`}</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
