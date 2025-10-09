import ProfileSection1 from "./ProfileSection1";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar";
import SearchRepo from "../repo/SearchRepo";
import { useEffect, useState } from "react";
import api from "../../Api";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import "./Stars.css";

export default function Stars() {
    const { userId } = useParams();
    const [userDetails, setUseDetails] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    useEffect(() => {
        const fetchUserStarRepos = async () => {
            const res = await api.get(`userProfile/${userId}`);
            setUseDetails(res.data);
        }
        console.log("Star Repos : ", userDetails?.starRepos);

        fetchUserStarRepos();
    }, [userId]);
    return (
        <>
            <Navbar userId={userId}/>
            <div id="main" className="starsMainResponsive">
                <ProfileSection1 userId={userId} />
                <section id="profileSection" className="viewRepoProfileSection">
                    <div id="repoViewerHeader">
                        <input type="text" placeholder="Find a repository..." id="SearchRepoitories"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoComplete="off"
                        />
                    </div>
                    {userDetails?.starRepos == 0 && (
                        <div className="noStarRepo">
                            <StarBorderIcon id="noStarRepoIcon"/>
                            <h2>You don’t have any starred repositories yet.</h2>
                        </div>
                        
                    )}
                    <SearchRepo repo={userDetails?.starRepos} query={searchQuery} userId={userId} cssClassName={"AllrepoContainer"} starSection={true}/>
                </section>
            </div>
        </>
    )
}