import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Issues.css";
import Navbar from "../Navbar";
import { Link, useParams } from "react-router-dom";
import api from "../../Api";

const Issues = () => {
    const { repoId } = useParams();
  const [issues, setIssues] = useState([]);
  const [filter, setFilter] = useState("open"); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/issue/all/${repoId}`);
      setIssues(res.data);
    } catch (err) {
      console.error("Error fetching issues:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = issues.filter((issue) => issue.status === filter);

  return (
    <>
    <Navbar repoId={repoId}/>
    <div className="issue-container">
      <div className="issue-header">
        <input
          type="text"
          className="search-box"
          placeholder="is:issue state:open"
        />
        <Link to={`/create/issue/${repoId}`}>
        <button className="new-issue-btn">New issue</button>
        </Link>
        
      </div>

      <div id="issuesContainer">
        <div className="tabs">
        <button
          className={filter === "open" ? "active" : ""}
          onClick={() => setFilter("open")}
        >
          Open ({issues.filter((i) => i.status === "open").length})
        </button>
        <button
          className={filter === "closed" ? "active" : ""}
          onClick={() => setFilter("closed")}
        >
          Closed ({issues.filter((i) => i.status === "closed").length})
        </button>
      </div>

      {loading ? (
        <p className="no-results">Loading...</p>
      ) : filteredIssues.length === 0 ? (
        <div className="no-results-div">
            <p className="no-results">No results</p>
        </div>
        
      ) : (
        <ul className="issue-list">
          {filteredIssues.map((issue) => (
            <li key={issue._id} className="issue-item">
              <div>
                <Link to={`/viewIssue/${issue._id}/repo/${repoId}`}>
                <strong>{issue.title}</strong>
                </Link>
                
                <p>{issue.openedBy?.username || "User no longer exists"}</p>
              </div>
              <span className={`status ${issue.status}`}>
                {issue.status.toUpperCase()}
              </span>
            </li>
          ))}
        </ul>
      )}

      </div>
      
    </div>
    </>
    
  );
};

export default Issues;
