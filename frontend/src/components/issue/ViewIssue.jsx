import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ViewIssue.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../Navbar";
import { Avatar } from "@mui/material";
import UserAvatar from "../user/UserAvatar";
import timeAgo from "../timeAgo";
import api from "../../Api";

const ViewIssue = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [activities, setActivities] = useState([]);
    const [issue, setIssue] = useState(null);
    const [repo, setRepo] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [tab, setTab] = useState("write");
    const { issueId, repoId } = useParams();
    const [loading, setLoading] = useState(false);
     const [commentLoading, setCommentLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isuueCloseLoading, setIsseuCloseLoading] = useState(false);
  const [reOpenLoading, setReOpenLoading] = useState(false);
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");


    useEffect(() => {
        fetchRepo();
        fetchIssue();
        fetchCurrentUser();
    }, [issueId, repoId, userId]);

    const fetchCurrentUser = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/userProfile/${userId}`);
            setCurrentUser(res.data);
        } catch (err) {
            console.log(err);
        }finally{
            setLoading(false);
        }
    }

    const fetchIssue = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/issue/${issueId}`);
            setIssue(res.data.issue);
            setActivities(res.data.activities);
        } catch (err) {
            console.error("Error fetching issue:", err);
        }finally{
            setLoading(false);
        }
    };

    const fetchRepo = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/repo/${repoId}`);
            setRepo(res.data);
        } catch (err) {
            console.log(err);
        }finally{
            setLoading(false);
        }
    }
    async function handleCloseIssue() {
        setIsseuCloseLoading(true);
        try{
            const res = await api.put(`/issue/close/${issueId}/user/${userId}`);
        setIssue(res.data.issue);
        setActivities(res.data.activities);
        }catch(err) {
            console.log(err);
        }finally{
            setIsseuCloseLoading(false);
        }
        
    }
    
    async function handleReOpenIssue() {
        setReOpenLoading(true);
        try {
            const res = await api.put(`/issue/open/${issueId}/user/${userId}`, {
            status: "open"
        });
        setIssue(res.data.issue);
        setActivities(res.data.activities);
        }catch(err) {
            console.log(err);
            
        }finally{
            setReOpenLoading(false);
        }
        
    }
    async function handleIssueDelete() {
        setDeleteLoading(true);
        try{
            await api.delete(`/issue/delete/${issueId}`,{
            repoId: repoId
        });
        navigate(`/Issues/${repoId}`)
        }catch(err) {
            console.log(err);
            
        }finally{
            setDeleteLoading(false);
        }
        
    }
    async function handleIssueEdit() {
        if (!isEditing) {
            setIsEditing(true);
            setEditTitle(issue.title);
            setEditDescription(issue.description);
            return;
        }
        try {
            const res = await api.put(
                `/issue/update/${issueId}/user/${userId}`,
                {
                    title: editTitle,
                    description: editDescription,
                }
            );
            setIssue(res.data.issue);
            setActivities(res.data.activities);
            setIsEditing(false);
        } catch (err) {
            console.error("Error editing issue:", err);
        }
    }

    async function handleSubmitComment() {
        setCommentLoading(true);
        try{
            const res = await api.post(`/issues/${issueId}/comment/${userId}`, {
            comment: newComment
        })
        setIssue(res.data.issue);
        setActivities(res.data.activities);
        setNewComment("");
        }catch(err) {
            console.log(err);
            
        }finally{
            setCommentLoading(false);
        }

        
    }

    if (!issue) return <p className="loading">Loading issue...</p>;

    return (
        <>
            <Navbar repoId={repoId} issueId={issueId} />
            <div className="view-issue-container">
                <div className="issue-title-edit">
                    {isEditing ? (
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                        />
                    ) : (
                        <h2>
                            {issue.title} <span className="issue-number">#{issue._id}</span>
                        </h2>
                    )}
                    {isEditing && (
                        <button
                            className="Canceledit-btn issue-edit-btn"
                            onClick={() => {
                                setIsEditing(false);
                                setEditTitle(issue.title);
                                setEditDescription(issue.description);
                            }}
                        >
                            Cancel
                        </button>
                    )}
                    <button className="issue-edit-btn" onClick={handleIssueEdit}>
                        {isEditing ? "Save" : "Edit"}
                    </button>

                </div>

                <div className="issue-status">

                    <span className={`status-badge ${issue.status}`}>
                        <svg focusable="false" aria-label="Issue" className="octicon octicon-issue-opened Octicon-sc-9kayk9-0 prc-StateLabel-Icon-NuDm4" role="img" viewBox="0 0 16 16" width={16} height={16} fill="currentColor" display="inline-block" overflow="visible" style={{ verticalAlign: 'text-bottom' }}><path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" /><path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z" /></svg>
                        {issue.status}
                    </span>
                </div>
                <div className="issue-body">
                    <div className="comment-body">
                        <div className="userAvatar">
                            <UserAvatar username={issue.openedBy?.username || "User no longer exists" } />
                        </div>
                        
                        <div className="comment-box">
                            <div className="comment-header">
                                <div className="userAvatarComment">
                                    <UserAvatar username={issue.openedBy?.username || "User no longer exists" } cssProfileId={"userAvaterResponsive"}/>
                                </div>
                                <Link to={issue.openedBy?._id ? `/profile/${issue.openedBy._id}` : "/account/delete"}>
                                    {issue.openedBy?.username || "User no longer exists"}
                                </Link>
                                opened
                            </div>
                            <div className="comment-content">
                                {isEditing ? (
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                    />
                                ) : (
                                    <p>{issue.description}</p>
                                )}

                            </div>
                        </div>
                    </div>

                    <div className="timeline">
                        {activities.map((a) => (
                            <div key={a._id} className="activity">
                                {a.comments ? (
                                    <div className="issueComment">
                                        <div className="userAvatar">
                                            <UserAvatar username={a.user?.username || "User no longer exists"} />
                                        </div>
                                        <div className="commentMain">
                                            <div className="commentDiv1">
                                                <div className="userAvatarComment">
                                                    <UserAvatar username={a.user?.username || "User no longer exists"} cssProfileId={"userAvaterResponsive"}/>
                                                </div>
                                                <Link to={ a.user?._id ? `/profile/${a.user._id}` : "/account/delete"}>{a.user?.username || "User no longer exists"}</Link>
                                                <small>{timeAgo(new Date(a.createdAt))}</small>
                                            </div>
                                            <div className="commentsOfIssues">
                                                <p>{a.comments}</p>
                                            </div>

                                        </div>

                                    </div>
                                ) : (
                                    <div className="otherActivity">
                                        <div className="activityInfoResponsive">
                                            <UserAvatar username={a.user?.username || "User no longer exists"} cssProfileId={"IssueProfile"} />
                                        <span>
                                            <span className="usernameOfIssue">
                                                <Link to={a.user?._id ? `/profile/${a.user._id}` : "/account/delete"}>{a.user?.username || "User no longer exists"}</Link>
                                            </span>
                                        </span>
                                        
                                        
                                        <p className="details">{a.details}</p>
                                        </div>
                                        {a.commitId ? (
                                            <Link to={`/view/${repo?.name}/${repoId}/allCommits/${a.commitId}`} className="issueIdLink">
                                                <b>#{issue._id}</b>
                                            </Link>
                                        ) : null}
                                        <small>{timeAgo(new Date(a.createdAt))}</small>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="add-comment">
                        <div className="commentSection">
                            <UserAvatar username={currentUser?.username} />
                            <label>Add a comment</label>
                        </div>
                        <div className="IssueComment">
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
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Use Markdown to format your comment"
                                    className="comment-textarea"
                                />
                            ) : (
                                <div className="preview-box">
                                    <p>
                                        {newComment || "Nothing to preview"}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="comment-actions">
                            {localStorage.getItem("userId") === repo?.owner?._id ? (
                                <button type="button" className="delete-btn" onClick={handleIssueDelete} disabled={deleteLoading}>
                                  {deleteLoading ? "deleting..." : "Delete issue"}  
                                </button>
                            ) : null}
                            {(issue.openedBy?._id === userId || issue.repository?.owner === userId) && (
                                issue.status !== "closed" ? (
                                    <button
                                        type="button"
                                        className="close-btn"
                                        onClick={handleCloseIssue}
                                        disabled={isuueCloseLoading}
                                    >
                                        {isuueCloseLoading ? "closing..." : "Close issue"}  
                                        
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        className="close-btn reOpen-btn"
                                        onClick={handleReOpenIssue}
                                        disabled={reOpenLoading}
                                    >
                                        <svg
                                            aria-hidden="true"
                                            focusable="false"
                                            className="octicon octicon-issue-reopened Octicon-sc-9kayk9-0 eMFpfy"
                                            viewBox="0 0 16 16"
                                            width={16}
                                            height={16}
                                            fill="currentColor"
                                            display="inline-block"
                                            overflow="visible"
                                            style={{ verticalAlign: "text-bottom" }}
                                        >
                                            <path d="M5.029 2.217a6.5 6.5 0 0 1 9.437 5.11.75.75 0 1 0 1.492-.154 8 8 0 0 0-14.315-4.03L.427 1.927A.25.25 0 0 0 0 2.104V5.75A.25.25 0 0 0 .25 6h3.646a.25.25 0 0 0 .177-.427L2.715 4.215a6.491 6.491 0 0 1 2.314-1.998ZM1.262 8.169a.75.75 0 0 0-1.22.658 8.001 8.001 0 0 0 14.315 4.03l1.216 1.216a.25.25 0 0 0 .427-.177V10.25a.25.25 0 0 0-.25-.25h-3.646a.25.25 0 0 0-.177.427l1.358 1.358a6.501 6.501 0 0 1-11.751-3.11.75.75 0 0 0-.272-.506Z" />
                                            <path d="M9.06 9.06a1.5 1.5 0 1 1-2.12-2.12 1.5 1.5 0 0 1 2.12 2.12Z" />
                                        </svg>
                                        {reOpenLoading ? "reopening..." : "Reopen issue"} 
                                        
                                    </button>
                                )
                            )}

                            <button type="submit" className="comment-btn" onClick={handleSubmitComment} disabled={commentLoading || newComment.trim() === ""}
                            style={{
                            backgroundColor: commentLoading || newComment.trim() === "" ? "#052f0d" : "#238636",
                            color: "white",
                            cursor: commentLoading || newComment.trim() === "" ? "not-allowed" : "pointer",
                            }}
                            >
                                 {commentLoading ? "Saving..." : "Comment"} 
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>

    );
};

export default ViewIssue;
