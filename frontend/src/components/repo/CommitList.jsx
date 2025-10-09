import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import "./CommitList.css";
import Navbar from "../Navbar";
import timeAgo from "../timeAgo.js";
import UserAvatar from "../user/UserAvatar.jsx";
import api from "../../Api.js";

export default function CommitList() {
  const [commitGroups, setCommitGroups] = useState({});
  const [repo, setRepo] = useState(null);
  const { repoId } = useParams();

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        const res = await api.get(`/repo/${repoId}`);
        setRepo(res.data);

        if (res.data?.commitChanges) {
          const grouped = groupCommitsByDate(res.data.commitChanges);
          setCommitGroups(grouped);
        }
      } catch (err) {
        console.error("Error fetching repo:", err);
      }
    };
    fetchRepo();
  }, [repoId]);

  function groupCommitsByDate(commits) {
    return commits.reduce((groups, commit) => {
      const dateKey = new Date(commit.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(commit);
      return groups;
    }, {});
  }

  return (
    <>
      <Navbar repoId={repoId} username={repo?.owner?.username} repoName={repo?.name}/>
      <div className="commitListContainer">
        <h1 className="commitTitle">Commits</h1>
        <hr className="divider" />

        <div className="commitsContainer">
          {Object.keys(commitGroups).map((date) => (
            <div key={date} className="commitGroup">
              <h3 className="commitDate">Commits on {date}</h3>
              <ul className="commits">
                {commitGroups[date].map((c) => (
                  <li key={c._id} className="commitItem">
                    <div className="commitMain">
                      <div className="commitInfo">
                        <Link
                          to={`/view/${repo?.name}/${repoId}/allCommits/${c.commitId}`}
                          className="commitLink"
                        >
                          <p className="commitMessage">{c.message}</p>
                        </Link>
                        <div className="commitAuthor">
                          <UserAvatar username={repo?.owner?.username} cssProfileId={"CommitListProfile"} />
                          <span className="authorName">{repo?.owner?.username}</span>{" "}
                          authored {timeAgo(new Date(c.date))}
                        </div>
                      </div>

                      <div className="commitMeta">
                        <span className="verifiedBadge">Verified</span>
                        <Link to={`/view/${repo?.name}/${repoId}/allCommits/${c.commitId}`} className="commitLink">
                          <span className="commitHash">
                            {c.commitId?.substring(0, 7)}
                          </span>
                        </Link>

                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
