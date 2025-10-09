import { Link, useLocation } from "react-router-dom";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useState } from "react";

export default function NavSidebar({
  username,
  repoName = null,
  repo,
  repoId,
  userId,
  issueId,
  commitId,
  fileName,
}) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const showRepoNav =
    location.pathname.startsWith("/GitHub") ||
    location.pathname.startsWith("/Issues") ||
    location.pathname.startsWith("/create/issue") ||
    location.pathname.startsWith("/viewIssue") ||
    location.pathname.startsWith("/view") ||
    location.pathname.startsWith("/fileContent") ||
    location.pathname.startsWith(`/${repoId}`);

  const showProfileNav =
    location.pathname.startsWith("/profile") ||
    location.pathname.startsWith("/Allrepo") ||
    location.pathname.startsWith("/stars") ||
    location.pathname.startsWith("/followers") ||
    location.pathname.startsWith("/following");

  return (
    <>
      {showRepoNav && (
        <div className={`navSidebar ${isSidebarOpen ? "open" : "closed"}`}>
          <div>
            <button className="moreOptionsBtn" onClick={handleSidebarToggle}>
              <MoreHorizIcon sx={{ fontSize: 20, color: "gray" }} />
            </button>

            <div className={`repoNavLinks sidebarLinks ${isSidebarOpen ? "show" : "hide"}`}>
              <Link
                to={`/GitHub/CurrentUser/${localStorage.getItem(
                  "userId"
                )}/repo/${repoId}`}
                className={
                  location.pathname ===
                    `/GitHub/CurrentUser/${localStorage.getItem(
                      "userId"
                    )}/repo/${repoId}` ||
                  location.pathname ===
                    `/view/${encodeURIComponent(repoName)}/${repoId}/allCommits/${commitId}` ||
                  location.pathname ===
                    `/GitHub/CurrentUser/${localStorage.getItem(
                      "userId"
                    )}/repo/${repoId}/commits` ||
                  location.pathname ===
                    `/fileContent/${repoId}/${commitId}/file/${encodeURIComponent(
                      fileName
                    )}`
                    ? "active"
                    : ""
                }
              >
                <svg aria-hidden="true" height={16} viewBox="0 0 16 16" version="1.1" width={16} data-view-component="true" className="octicon octicon-code UnderlineNav-octicon d-none d-sm-inline">
                <path d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L.47 8.53a.75.75 0 0 1 0-1.06Z" fill="#c1b9b9" />
              </svg>
                <b>Code</b>
              </Link>

              <Link
                to={`/Issues/${repoId}`}
                className={
                  location.pathname === `/Issues/${repoId}` ||
                  location.pathname === `/create/issue/${repoId}` ||
                  location.pathname === `/viewIssue/${issueId}/repo/${repoId}`
                    ? "active"
                    : ""
                }
              >
                <svg aria-hidden="true" height={16} viewBox="0 0 16 16" version="1.1" width={16} data-view-component="true" className="octicon octicon-issue-opened UnderlineNav-octicon d-none d-sm-inline">
                <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill="#c1b9b9" /><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" fill="#c1b9b9" />
              </svg>
                <b>
                  Issues
                </b>

              </Link>

              {repo?.owner?._id === localStorage.getItem("userId") && (
                <Link
                  to={`/${repoId}/settings`}
                  className={
                    location.pathname === `/${repoId}/settings`
                      ? "active"
                      : ""
                  }
                >
                  <svg aria-hidden="true" height={16} viewBox="0 0 16 16" version="1.1" width={16} data-view-component="true" className="octicon octicon-gear UnderlineNav-octicon d-none d-sm-inline">
                  <path d="M8 0a8.2 8.2 0 0 1 .701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.082.233.09.299.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.315.675.111 1.422-.364 1.891l-.814.806c-.049.048-.098.147-.088.294.016.257.016.515 0 .772-.01.147.038.246.088.294l.814.806c.475.469.679 1.216.364 1.891a7.977 7.977 0 0 1-.704 1.217c-.428.61-1.176.807-1.82.63l-1.102-.302c-.067-.019-.177-.011-.3.071a5.909 5.909 0 0 1-.668.386c-.133.066-.194.158-.211.224l-.29 1.106c-.168.646-.715 1.196-1.458 1.26a8.006 8.006 0 0 1-1.402 0c-.743-.064-1.289-.614-1.458-1.26l-.289-1.106c-.018-.066-.079-.158-.212-.224a5.738 5.738 0 0 1-.668-.386c-.123-.082-.233-.09-.299-.071l-1.103.303c-.644.176-1.392-.021-1.82-.63a8.12 8.12 0 0 1-.704-1.218c-.315-.675-.111-1.422.363-1.891l.815-.806c.05-.048.098-.147.088-.294a6.214 6.214 0 0 1 0-.772c.01-.147-.038-.246-.088-.294l-.815-.806C.635 6.045.431 5.298.746 4.623a7.92 7.92 0 0 1 .704-1.217c.428-.61 1.176-.807 1.82-.63l1.102.302c.067.019.177.011.3-.071.214-.143.437-.272.668-.386.133-.066.194-.158.211-.224l.29-1.106C6.009.645 6.556.095 7.299.03 7.53.01 7.764 0 8 0Zm-.571 1.525c-.036.003-.108.036-.137.146l-.289 1.105c-.147.561-.549.967-.998 1.189-.173.086-.34.183-.5.29-.417.278-.97.423-1.529.27l-1.103-.303c-.109-.03-.175.016-.195.045-.22.312-.412.644-.573.99-.014.031-.021.11.059.19l.815.806c.411.406.562.957.53 1.456a4.709 4.709 0 0 0 0 .582c.032.499-.119 1.05-.53 1.456l-.815.806c-.081.08-.073.159-.059.19.162.346.353.677.573.989.02.03.085.076.195.046l1.102-.303c.56-.153 1.113-.008 1.53.27.161.107.328.204.501.29.447.222.85.629.997 1.189l.289 1.105c.029.109.101.143.137.146a6.6 6.6 0 0 0 1.142 0c.036-.003.108-.036.137-.146l.289-1.105c.147-.561.549-.967.998-1.189.173-.086.34-.183.5-.29.417-.278.97-.423 1.529-.27l1.103.303c.109.029.175-.016.195-.045.22-.313.411-.644.573-.99.014-.031.021-.11-.059-.19l-.815-.806c-.411-.406-.562-.957-.53-1.456a4.709 4.709 0 0 0 0-.582c-.032-.499.119-1.05.53-1.456l.815-.806c.081-.08.073-.159.059-.19a6.464 6.464 0 0 0-.573-.989c-.02-.03-.085-.076-.195-.046l-1.102.303c-.56.153-1.113.008-1.53-.27a4.44 4.44 0 0 0-.501-.29c-.447-.222-.85-.629-.997-1.189l-.289-1.105c-.029-.11-.101-.143-.137-.146a6.6 6.6 0 0 0-1.142 0ZM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9.5 8a1.5 1.5 0 1 0-3.001.001A1.5 1.5 0 0 0 9.5 8Z" fill="#b7b8b9" />
                </svg>
                  <b>Settings</b>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      {showProfileNav && (
        <div className={`navSidebar ${isSidebarOpen ? "open" : "closed"}`}>
          <div >
            <button className="moreOptionsBtn" onClick={handleSidebarToggle}>
              <MoreHorizIcon sx={{ fontSize: 20, color: "gray" }} />
            </button>

            <div className={`repoNavLinks sidebarLinks ${isSidebarOpen ? "show" : "hide"}`}>
              <Link
                to={`/profile/${userId}`}
                className={
                  location.pathname === `/profile/${userId}` ? "active" : ""
                }
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-book UnderlineNav-octicon">
                <path d="M0 1.75A.75.75 0 0 1 .75 1h4.253c1.227 0 2.317.59 3 1.501A3.743 3.743 0 0 1 11.006 1h4.245a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-.75.75h-4.507a2.25 2.25 0 0 0-1.591.659l-.622.621a.75.75 0 0 1-1.06 0l-.622-.621A2.25 2.25 0 0 0 5.258 13H.75a.75.75 0 0 1-.75-.75Zm7.251 10.324.004-5.073-.002-2.253A2.25 2.25 0 0 0 5.003 2.5H1.5v9h3.757a3.75 3.75 0 0 1 1.994.574ZM8.755 4.75l-.004 7.322a3.752 3.752 0 0 1 1.992-.572H14.5v-9h-3.495a2.25 2.25 0 0 0-2.25 2.25Z" fill="gray"></path>
              </svg>
                <b>Overview</b>
              </Link>

              <Link
                to={`/Allrepo/user/${userId}`}
                className={
                  location.pathname === `/Allrepo/user/${userId}`
                    ? "active"
                    : ""
                }
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-repo UnderlineNav-octicon">
                <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" fill="gray"></path>
              </svg>
                <b>Repositories</b>
              </Link>

              <Link
                to={`/stars/${userId}`}
                className={
                  location.pathname === `/stars/${userId}` ? "active" : ""
                }
              >
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" class="octicon octicon-star UnderlineNav-octicon">
                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z" fill="gray"></path>
              </svg>
                <b>Stars</b>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
