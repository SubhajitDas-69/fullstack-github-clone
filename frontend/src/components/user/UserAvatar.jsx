
import { Avatar } from "@mui/material";
import axios from "axios";
import { useState } from "react";
import { useEffect } from "react";
import api from "../../Api";

export default function UserAvatar({username, cssProfileId, userId}) {
  const [user, setUser] = useState("");
  useEffect(() => {
    const fetchUser = async ()=>{
      if (!userId) return;
      try {
        const res = await api.get(`/userProfile/${userId}`);
        setUser(res.data.username);
      } catch (err) {
        console.error("Failed to fetch user profile:", err.message);
      }
    }
    fetchUser(); 
  },[userId]);

  let letter="";

  if(username!== undefined){
  letter = username ? username[0].toUpperCase() : "?";
  } else {
    letter = user ? user[0].toUpperCase() : "?";
  }

  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).slice(-2);
    }
    return color;
  };

  let bgColor = "";
  if(username!== undefined){
    bgColor = username ? stringToColor(username) : "#888";
  } else {
    bgColor = user ? stringToColor(user) : "#888";
  }

  return (
    <Avatar
      sx={{
        bgcolor: bgColor,
      }}
      id= {cssProfileId}
    >
      {letter}
    </Avatar>
  );
}
