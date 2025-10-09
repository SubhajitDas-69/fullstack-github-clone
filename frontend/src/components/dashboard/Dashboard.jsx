import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./Dashboard.css";
import Navbar from "../Navbar";
import { Link } from "react-router-dom";
import { Avatar } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import useSearchFilter from "../repo/useSearchFilter";
import UserAvatar from "../user/UserAvatar";
import api from "../../Api.js";

const Dashboard = () => {
    const [repositories, setRepositories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");;
    const [suggestedRepositories, setSuggestedRepositories] = useState([]);
    const [suggestedRepoSearchQuery, setSuggestedRepoSearchQuery] = useState("");

    const searchResults = useSearchFilter(repositories, searchQuery);
    const suggestedRepoSearchResults = useSearchFilter(suggestedRepositories, suggestedRepoSearchQuery);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        const fetchRepositories = async () => {
            try {
                const res = await api.get(`/repo/user/${userId}`);
                setRepositories(res.data.repositories);
                // console.log(repositories);
            } catch (err) {
                console.error("Error during fetching repositories", err);
            }
        }

        const fetchSuggestedRepositories = async () => {
            try {
                const res = await api.get(`/repo/all`);
                setSuggestedRepositories(res.data);
                // console.log(suggestedRepositories);
            } catch (err) {
                console.error("Error during fetching repositories", err);
            }
        }

        fetchRepositories();
        fetchSuggestedRepositories();
    }, []);
    return (
        <>
            <Navbar userId={localStorage.getItem("userId")}/>
            <section id="Dashboard">
                <main>
                    <div className="yourRepo">
                        <div className="dasborardMain">
                            <b>Your Repositories</b>
                            <Link to={"/create"} id="createNewRepo">
                                <button className="newRepoCreateBtn dasboardCreateRepobtn">
                                    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="octicon octicon-repo" style={{ fill: "white" }}>
                                        <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
                                    </svg>
                                    <b>New</b>
                                </button>
                            </Link>
                        </div>

                        <div id="search">
                            <input type="text" value={searchQuery} placeholder="Find a repository..."
                                onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        {searchResults.map((repo) => {
                            return (
                                <div key={repo._id} className="repositories">
                                    <UserAvatar username={repo.owner?.username} cssProfileId={"dasboardProfile"}/>
                                    <Link to={`/GitHub/CurrentUser/${localStorage.getItem("userId")}/repo/${repo._id}`}>
                                        <h4>{repo.owner?.username}/{repo.name}</h4>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </main>
                <div id="asides">
                    <aside id="aside1">
                        <h2>Home</h2>
                        <input type="text" placeholder="Find recommended repositories..." value={suggestedRepoSearchQuery}
                        onChange={(e)=> setSuggestedRepoSearchQuery(e.target.value)}/>
                        <div id="suggestedRepo">
                            <h3>Suggested Repositories</h3>
                    {suggestedRepoSearchResults.map((repo) => {
                        return (
                            <div key={repo._id} id="repositoryLists">
                                <div className="repoAll">
                                    <GitHubIcon sx={{ fontSize: 18, color: "white" }} />
                                    <Link to={`/GitHub/CurrentUser/${localStorage.getItem("userId")}/repo/${repo._id}`}>
                                    <h4>{repo.owner?.username} / {repo.name}</h4>
                                    </Link>
                                </div>
                               

                                <p className="repoDes">{repo.description}</p>
                            </div>
                        );
                    })}
                        </div>
                    
                </aside>

                <aside className="events">
                    <h3>Upcoming Events</h3>
                    <ul>
                        <li><p>Tech Conference - Dec 15</p></li>
                        <li><p>Developer Meetup - Dec 25</p></li>
                        <li><p>React Summit - Jan 5</p></li>
                    </ul>
                </aside>
                </div>
                
            </section>
        </>

    )
}

export default Dashboard;