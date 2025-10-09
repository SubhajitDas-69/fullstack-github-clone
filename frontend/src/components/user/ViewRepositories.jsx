import ProfileSection1 from "./ProfileSection1";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import Navbar from "../Navbar";
import './ViewRepositories.css';
import SearchRepo from "../repo/SearchRepo";
import api from "../../Api";

export default function ViewRepositories() {
    const [repositories, setRepositories] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const {userId} = useParams();
    useEffect(() => {
        const fetchUserDetails = async () => {
            // const userId = localStorage.getItem("userId");
            if (userId) {
                try {
                    const res = await api.get(`/repo/user/${userId}`);
                    setRepositories(res.data.repositories);
                } catch (err) {
                    console.error("Cannot fetch user details: ", err);
                }
            }
        };
        fetchUserDetails();
    }, []);
    return (

        <div>
            <Navbar userId={userId}/>
            <div id="main" className="viewRepoResponsive">
                <ProfileSection1 userId={userId}/>
                <div id="profileSection" className="viewRepoProfileSection">
                    <div id="repoViewerHeader" className="viewFlex">
                        <input type="text" placeholder="Find a repository..." id="SearchRepoitories"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoComplete="off"
                        className="viewRepoSearchInput"
                        />
                        <Link to={"/create"} id="createNewRepo">
                        <button className="newRepoCreateBtn">
                            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true" className="octicon octicon-repo" style={{ fill: "white" }}>
                                <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
                            </svg>
                            <b>New</b>
                        </button>
                        </Link>
                    </div>
                    <SearchRepo repo={repositories} cssClassName={"AllrepoContainer"} query={searchQuery} userId={userId}/>
                </div>

            </div>

        </div>
    )
}