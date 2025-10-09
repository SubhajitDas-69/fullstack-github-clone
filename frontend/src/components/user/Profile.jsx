import { useEffect, useState } from "react";
import Navbar from "../Navbar";
import axios from "axios";
import "./Profile.css";
import { Button } from "@mui/material";
import { Link, useNavigate, useParams } from "react-router-dom";
import HeatMapProfile from "./HeatMap";
import { useAuth } from "../../authContext";
import ProfileSection1 from "./ProfileSection1";
import api from "../../Api";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const Profile = () => {
    const navigate = useNavigate();

    const [repositories, setRepositories] = useState([]);
    const { setCurrentUser } = useAuth();
    const { userId } = useParams("userId");

    useEffect(() => {
        const fetchUserDetails = async () => {

            if (userId) {
                try {

                    const res = await api.get(`/repo/user/${userId}`);
                    setRepositories(res.data.repositories);
                    console.log(repositories);

                } catch (err) {
                    console.error("Cannot fetch user details: ", err);
                }
            }
        };
        fetchUserDetails();
    }, []);


    return (
        <>
            <Navbar userId={userId} />
            {/* <div id="header">
                <p>Overview</p>
                <p>Repositories</p>
                <p>Stars</p>

                <Button id="logout"
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("userId");
                        setCurrentUser(null);
                        navigate("/auth");
                    }}
                >Logout</Button>

            </div> */}
            <div id="main" className="mainProfileResponsive">
                <ProfileSection1 userId={userId} />
                <section id="profileSection">
                    <p style={{ marginLeft: "2rem" }} id="repoHeading">Repositories</p>
                    <div id="userRepo">
                        {repositories.slice(0, 6).map((repo) => (
                            <div key={repo._id} className="repo">
                                <div className="repoSpan">
                                    <Link to={`/GitHub/CurrentUser/${localStorage.getItem("userId")}/repo/${repo._id}`} id="repoPath">
                                        <b>{repo.name}</b>
                                    </Link>
                                    <small className="visibility">{repo.visibility}</small>
                                </div>

                                <div className="repoOverview">
                                    <p>{repo.description?.length > 150
                                        ? repo.description.slice(0, 150) + "..."
                                        : repo.description}
                                    </p>
                                </div>
                                {repo.stars != 0 && (
                                    <div id="noOfRepoStar">
                                        <StarBorderIcon className="starBorder" /> <span>{repo.stars}</span>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>

                    <h4 style={{ marginLeft: "2rem" }} id="contributionHeading">Recent Contributions</h4>
                    <div style={{ width: "94%", margin: "auto", paddingTop: "1rem" }}>
                        <div id="HeatMap">
                            <HeatMapProfile />
                        </div>
                    </div>


                </section>
            </div>
        </>

    )
}

export default Profile;



