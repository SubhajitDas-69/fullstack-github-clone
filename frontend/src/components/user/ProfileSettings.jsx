import { useEffect, useState } from "react";
import UserAvatar from "./UserAvatar"
import api from "../../Api";
import Navbar from "../Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../authContext";

export default function ProfileSettings() {
  const navigate = useNavigate();
    const { setCurrentUser } = useAuth();
    const userId = localStorage.getItem("userId");
    const [user, setUser] = useState(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [userDetails, setUserDetails] = useState({
    username: "",
    bio: "",
    company: "",
  });

    useEffect(() => {
    const fetchUserDetails = async () => {
      try{
        const res = await api.get(`/userProfile/${userId}`);
        setUser(res.data);
        setUserDetails({
        username: res.data.username || "",
        bio: res.data.bio || "",
        company: res.data.company || "",
      });
      }catch(e) {
        console.error("Error fetching user details:", err);
      }
    }
    fetchUserDetails();
  }, [userId]);

   const handleUpdateProfile = async () => {
    setUpdateLoading(true);
    try {
      const res = await api.put(`/updateProfile/${userId}`, {
        username: userDetails.username,
        bio: userDetails.bio,
        company: userDetails.company,
      });
      setUser(res.data);
    } catch (err) {
      console.error("Error saving profile: ", err);
    }finally{
      setUpdateLoading(false);
    }
  };
  const handleUserDelete = async () => {
    setDeleteLoading(true);
    try{
      await api.delete(`/deleteProfile/${userId}`);
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      setCurrentUser(null);
      navigate("/signup");
    }catch(e) {
      console.log("Error during deleting account");
      
    }finally{
      setDeleteLoading(false);
    }
    
  }
    return (
        <>
        <Navbar/>
        <div id="profileSettingContainer">
            <div id="profileSettingHeader">
                <UserAvatar username={user?.username}/>
                <span>
                    <b id="usernameTag">{user?.username}</b>
                    <p>Your personal account</p>
                </span>
            </div>
            <h2>Public profile</h2>
            <div className="settingsContent">
                <p>Name</p>
                <input type="text" className="settingsUpdateInput"
                value={userDetails?.username}
                onChange={(e)=> 
                    setUserDetails((prev) => ({
                        ...prev,
                        username: e.target.value
                    }))
                }
                />
                <p>Bio</p>
                <textarea name="" id="" placeholder="Tell us a little bit about yourself"
                value={userDetails.bio}
                onChange={(e) =>
                  setUserDetails((prev) => ({ ...prev, bio: e.target.value }))
                }
                ></textarea>
                <p>Company</p>
                <input type="text" className="settingsUpdateInput"
                value={userDetails.company}
                onChange={(e) =>
                  setUserDetails((prev) => ({ ...prev, company: e.target.value }))
                }
                />
            </div>
            <button id="profileUpdateBtn" onClick={handleUpdateProfile}
            disabled={updateLoading}
            >{updateLoading ? "updating...":"Update profile"}
            </button>

            <div>
                <h2 id="deleteHeader">Delete account</h2>
                <hr className="profileDivider"/>
                <p id="deleteAwarness">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="dengerZoneBtn"
                onClick={handleUserDelete}
                disabled={deleteLoading}
                > {deleteLoading ? "deleting account..." : "Delete your account"}
                </button>
            </div>
        </div>
        </>
    )
}