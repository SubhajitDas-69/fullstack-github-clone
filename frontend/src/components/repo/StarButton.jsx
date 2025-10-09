import { useEffect, useState } from "react";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import axios from "axios";
import { useLocation } from "react-router-dom";
import api from "../../Api";

export default function StarButton({ repo }) {
  const location = useLocation();
  const [isStarred, setIsStarred] = useState(false);
  const repoId = repo._id;
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    if (!repo || !userId) return;
    setIsStarred(repo.starredBy.includes(userId));
    console.log("repoID : ", repoId);


  }, [repo, userId]);

  const toggleStar = async () => {
    try {
      if (isStarred) {
        await api.post(
          `/repo/${repoId}/unstar/${userId}`
        );
      } else {
        await api.post(
          `/repo/${repoId}/star/${userId}`
        );
      }
      setIsStarred(!isStarred);
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  };

  return (
    <div className="starBtn">
      <button onClick={toggleStar}>
        {isStarred ? (
          <>
            <StarIcon id="starIcon" />
            <span className="starText">Starred</span>
          </>
        ) : (
          <>
            <StarBorderIcon id="starBorderIcon" />
            <span className="starText">Star</span>
          </>
        )}
        {location.pathname.startsWith("/GitHub") && 
        repo.stars != 0 ? 
        (
              <div className="starNum">
                <b>{repo.stars}</b>
              </div>
        ) : null}
      </button>
    </div>
  );
}
