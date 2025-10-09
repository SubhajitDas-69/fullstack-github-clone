import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import UserAvatar from "./UserAvatar";
import api from "../../Api";
import { Link } from "react-router-dom";

export default function ProfileSection1({ userId }) {
  const [userDetails, setUserDetails] = useState({
    username: "User no longer exists",
    bio: "",
    company: "",
    followers: [],
    following: [],
  });
  const [user, setUser] = useState({ username: "", bio: "", company: "" });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [backupDetails, setBackupDetails] = useState(null);
  const currentUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (userId) {
        try {
          const response = await api.get(`/userProfile/${userId}`);
          setUserDetails({
            _id: response.data._id,
            username: response.data.username || "",
            bio: response.data.bio || "",
            company: response.data.company || "",
            followers: response.data.followers || [],
            following: response.data.following || []

          });
          setUser({
            username: response.data.username || "",
            bio: response.data.bio || "",
            company: response.data.company || ""
          });
          const following = response.data.followers?.includes(currentUserId);
          setIsFollowing(following);
        } catch (err) {
          console.error("Cannot fetch user details: ", err);
        }
      }
    };
    fetchUserDetails();
  }, [userId, currentUserId]);

  const handleFollowClick = async () => {
    try {
      if (isFollowing) {
        await api.post(`/${userDetails._id}/unfollow`);
        setIsFollowing(false);
        setUserDetails(prev => ({
          ...prev,
          followers: prev.followers.filter(f => f !== currentUserId)
        }));
      } else {
        await api.post(`/${userDetails._id}/follow`);
        setIsFollowing(true);
        setUserDetails(prev => ({
          ...prev,
          followers: [...(prev.followers || []), currentUserId]
        }));
      }
    } catch (err) {
      console.error("Error following/unfollowing user: ", err);
    }
  };

  const handleEditProfile = () => {
    setBackupDetails(userDetails);
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      const res = await api.put(`/updateProfile/${userDetails._id}`, {
        username: user.username,
        bio: user.bio,
        company: user.company,
      });
      setIsEditing(false);
      setUserDetails({
        ...res.data,
        followers: userDetails.followers,
        following: userDetails.following,
      });
    } catch (err) {
      console.error("Error saving profile: ", err);
    }
  };

  const handleCancelEdit = () => {
    setUser({
      username: backupDetails.username,
      bio: backupDetails.bio,
      company: backupDetails.company,
    });
    setIsEditing(false);
  };

  return (
    <section id="section1" className="profileSection1Responsive">


      {isEditing ? (
        <div>

          <div className="editProfileSection">
            <div className="profileSection1Header">
              <UserAvatar
                username={userDetails.username}
                profileImage={userDetails.profileImage}
                cssProfileId={"profilePic"}
              />
              <div>
                <b>Name</b>
                <input
                  type="text"
                  value={user.username}
                  onChange={(e) =>
                    setUser((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }))
                  }
                  className="editProfileInput"
                />
              </div>

            </div>

            <div className="userBioEdit">
              <b>Bio</b>
            <textarea name="" id="profileBioEdit"
              placeholder="Add bio"
              value={user.bio}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, bio: e.target.value }))
              }
            ></textarea>
            </div>
            
            <div className="profileCompanyedit userCompanyResponsive">
              <svg style={{ width: 20 }} aria-hidden="true" height={20} viewBox="0 0 16 16" version="1.1" width={20} data-view-component="true" className="octicon octicon-organization">
                <path d="M1.75 16A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 0 0 .25-.25V8.285a.25.25 0 0 0-.111-.208l-1.055-.703a.749.749 0 1 1 .832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0 1 14.25 16h-3.5a.766.766 0 0 1-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 0 1-.75-.75V14h-1v1.25a.75.75 0 0 1-.75.75Zm-.25-1.75c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM3.75 6h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 3.75A.75.75 0 0 1 3.75 3h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 3.75Zm4 3A.75.75 0 0 1 7.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 7 6.75ZM7.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 9.75A.75.75 0 0 1 3.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 9.75ZM7.75 9h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Z" fill="gray" />
              </svg>
              <input type="text"
                value={user.company}
                onChange={(e) =>
                  setUser((prev) => ({ ...prev, company: e.target.value }))
                }
              />
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }} className="profileEditBtnDiv">
              <Button
                onClick={handleSaveProfile}
                className="saveProfileBtn"
              >
                Save
              </Button>
              <Button
                onClick={handleCancelEdit}
                className="cancelProfileBtn"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="profileSection1Header">
            <UserAvatar
              username={userDetails.username}
              profileImage={userDetails.profileImage}
              cssProfileId={"profilePic"}
            />
            <h2>{userDetails.username}</h2>
          </div>

          <div className="userBio">
            <p>{userDetails?.bio}</p>
          </div>

          {userId === currentUserId ? (
            <Button
              sx={{ width: "100%", bgcolor: "#2f3031ff" }}
              className="ProfileBtn"
              onClick={handleEditProfile}
            >
              Edit profile
            </Button>
          ) : (
            userId &&
            <Button
              sx={{ width: "100%", bgcolor: "#2f3031ff" }}
              className="ProfileBtn"
              onClick={handleFollowClick}
            // className="followBtn"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}

          {(userDetails.followers?.length > 0 ||
            userDetails.following?.length > 0) && (
              <div className="followDetails">
                <svg
                  aria-hidden="true"
                  height="16"
                  viewBox="0 0 16 16"
                  width="16"
                  className="octicon octicon-people followSVG"
                >
                  <path
                    d="M2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a3.001 3.001 0 0 1 2.22 5.018 5.01 5.01 0 0 1 2.56 3.012.749.749 0 0 1-.885.954.752.752 0 0 1-.549-.514 3.507 3.507 0 0 0-2.522-2.372.75.75 0 0 1-.574-.73v-.352a.75.75 0 0 1 .416-.672A1.5 1.5 0 0 0 11 5.5.75.75 0 0 1 11 4Zm-5.5-.5a2 2 0 1 0-.001 3.999A2 2 0 0 0 5.5 3.5Z"
                    fill="white"
                  ></path>
                </svg>
                <Link to={`/followers/${userDetails._id}`}>
                  <p>
                    <span>{userDetails.followers.length}</span> Followers
                  </p>
                </Link>
                <span id="separate">.</span>
                <Link to={`/following/${userDetails._id}`}>
                  <p>
                    <span>{userDetails.following.length}</span> Following
                  </p>
                </Link>
              </div>
            )}
          {userDetails?.company && (
            <div className="profileCompanyedit userCompany">
              <svg style={{ width: 20 }} aria-hidden="true" height={20} viewBox="0 0 16 16" version="1.1" width={20} data-view-component="true" className="octicon octicon-organization">
                <path d="M1.75 16A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 0 0 .25-.25V8.285a.25.25 0 0 0-.111-.208l-1.055-.703a.749.749 0 1 1 .832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0 1 14.25 16h-3.5a.766.766 0 0 1-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 0 1-.75-.75V14h-1v1.25a.75.75 0 0 1-.75.75Zm-.25-1.75c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25ZM3.75 6h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 3.75A.75.75 0 0 1 3.75 3h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 3.75Zm4 3A.75.75 0 0 1 7.75 6h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 7 6.75ZM7.75 3h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5ZM3 9.75A.75.75 0 0 1 3.75 9h.5a.75.75 0 0 1 0 1.5h-.5A.75.75 0 0 1 3 9.75ZM7.75 9h.5a.75.75 0 0 1 0 1.5h-.5a.75.75 0 0 1 0-1.5Z" fill="gray" />
              </svg>
              <b>{userDetails?.company}</b>
            </div>
          )}

        </div>
      )}
    </section>
  );
}
