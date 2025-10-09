import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../Navbar";
import ProfileSection1 from "./ProfileSection1";
import UserAvatar from "./UserAvatar";
import api from "../../Api";
export default function Following() {
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myFollowing, setMyFollowing] = useState([]);
  const currentUserId = localStorage.getItem("userId");
  const { userId } = useParams();

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const res = await api.get(`/${userId}/following`);
        setFollowing(res.data);
        const meRes = await api.get(`/${currentUserId}/following`);
        setMyFollowing(meRes.data.map(u => u._id));
      } catch (err) {
        console.error("Cannot fetch following: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [userId, currentUserId]);

  const handleFollowClick = async (targetUserId) => {
    try {
      if (myFollowing.includes(targetUserId)) {
        await api.post(`/${targetUserId}/unfollow`);
        setMyFollowing(prev => prev.filter(id => id !== targetUserId));
      } else {
        await api.post(`/${targetUserId}/follow`);
        setMyFollowing(prev => [...prev, targetUserId]);
      }
    } catch (err) {
      console.error("Error following/unfollowing user: ", err);
    }
  };

  return (
    <>
      <Navbar userId={userId}/>
      <div id="main">
        <ProfileSection1 userId={userId} />
        <div id="profileSection">
          {loading ? (
            <p>Loading following...</p>
          ) : following?.length === 0 ? (
            <div className="noFollowers">
                <svg aria-hidden="true" height={24} viewBox="0 0 24 24" version="1.1" width={24} data-view-component="true" className="octicon octicon-people blankslate-icon">
  <path d="M3.5 8a5.5 5.5 0 1 1 8.596 4.547 9.005 9.005 0 0 1 5.9 8.18.751.751 0 0 1-1.5.045 7.5 7.5 0 0 0-14.993 0 .75.75 0 0 1-1.499-.044 9.005 9.005 0 0 1 5.9-8.181A5.496 5.496 0 0 1 3.5 8ZM9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8.29 4c-.148 0-.292.01-.434.03a.75.75 0 1 1-.212-1.484 4.53 4.53 0 0 1 3.38 8.097 6.69 6.69 0 0 1 3.956 6.107.75.75 0 0 1-1.5 0 5.193 5.193 0 0 0-3.696-4.972l-.534-.16v-1.676l.41-.209A3.03 3.03 0 0 0 17.29 8Z" fill="gray"/>
</svg>

              <h2>You don’t follow anyone yet.</h2>
            </div>
          ) : (
            <div className="followersList">
              <ul>
                {following.map((follow) => (
                  <li key={follow._id}>
                    <Link to={`/profile/${follow._id}`}>
                      <UserAvatar
                        username={follow.username}
                        cssProfileId={"followerAvatar"}
                      />
                      <div className="followInfo">
                        <p>{follow.username}</p>
                      {follow.bio && (
                        <div>
                          <p>{follow.bio?.length > 200
                          ? follow.bio.slice(0, 200) + "..."
                          : follow.bio }</p>
                        </div>
                      )}
                      </div>
                      
                    </Link>
                    {follow._id !== currentUserId && (
                      <button onClick={() => handleFollowClick(follow._id)}
                      className="followUnfollwowBtn"
                      >
                        {myFollowing.includes(follow._id) ? "Unfollow" : "Follow"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
