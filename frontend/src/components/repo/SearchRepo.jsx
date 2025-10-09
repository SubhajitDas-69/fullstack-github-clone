import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import StarButton from "./StarButton";

export default function SearchRepo({ repo, cssClassName, query, userId, starSection = false }) {

    const [searchResults, setSearchResults] = useState([]);
    const [starredRepos, setStarredRepos] = useState({});
    // const userId = localStorage.getItem("userId");
    useEffect(() => {
        if (!repo) return;
        if (query.trim() === "") {
            setSearchResults(repo);
        } else {
            const filteredRepo = repo.filter(
                (item) =>
                    item?.name?.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(filteredRepo);
            console.log(filteredRepo);

        }
    }, [query, repo]);

    // useEffect(() => {
    //     if (!repo || !userId) return;
    //     const initialStarred = {};
    //     repo.forEach((r) => {
    //         if (r.starredBy.includes(userId)) {
    //             initialStarred[r._id] = true;
    //         }
    //     });
    //     setStarredRepos(initialStarred);
    // }, [repo, userId]);

    // const toggleStar = async (repoId) => {
    //     try {
    //         const isStarred = starredRepos[repoId];
    //         let res;

    //         if (isStarred) {
    //             res = await axios.post(
    //                 `http://localhost:3000/repo/${repoId}/unstar/${userId}`
    //             );
    //         } else {
    //             res = await axios.post(
    //                 `http://localhost:3000/repo/${repoId}/star/${userId}`
    //             );
    //         }
    //         const starredMap = {};
    //         res.data.starredRepos.forEach((id) => {
    //             starredMap[id] = true;
    //         });
    //         setStarredRepos(starredMap);
    //     } catch (error) {
    //         console.error("Error toggling star:", error);
    //     }
    // };

    if (!repo) {
        return <p>Loading...</p>;
    }
    return (
        <>
            <div className={cssClassName}>
                {searchResults.map((repo) => {
                    return (
                        <div className="Allrepo">

                            <div key={repo._id}>
                                <div className="SearchRepoSpan">
                                    <Link to={`/GitHub/CurrentUser/${localStorage.getItem("userId")}/repo/${repo._id}`} id="repoPath">
                                        {starSection ? (
                                            <b>{repo?.owner?.username} / {repo.name}</b>
                                        ) : (
                                            <b>{repo.name}</b>
                                        )}

                                    </Link>
                                    <small className="visibility">{repo.visibility}</small>
                                </div>

                                <div className="repoDescription">
                                    <p>{repo.description?.length > 200
                                        ? repo.description.slice(0, 200) + "..."
                                        : repo.description}
                                    </p>
                                </div>

                                <div>
                                    {repo.stars != 0 ? (
                                        <div id="noOfRepoStar">
                                            <StarBorderIcon className="starBorder" /> <span>{repo.stars}</span>
                                        </div>
                                    ) : (
                                        null
                                    )}
                                </div>
                            </div>

                            <StarButton repo={repo} />
                        </div>
                    )
                })}
            </div>
        </>
    )
}