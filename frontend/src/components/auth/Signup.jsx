import React, { useState } from "react";
import axios from 'axios';
import { useAuth } from "../../authContext";
import {Box, Button, TextField, Typography, Paper, Avatar} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Link } from "react-router-dom";
import "./Signup.css"

export default function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const {setCurrentUser} = useAuth();

  const handleSignup = async (e)=>{
    e.preventDefault();

    try{
      setLoading(true);
      const res = await axios.post("https://fullstack-github-clone.onrender.com/signup",{
        email: email,
        password: password,
        username: username,
        bio: bio,
        company: company
      });

      localStorage.setItem("token",res.data.token);
      localStorage.setItem("userId",res.data.userId);

      setCurrentUser(res.data.userId);
      setLoading(false);

      window.location.href = '/';
    }catch(err){
      console.error(err);
      alert("Signup Falied!");
      setLoading(false);
    }
  }
    return (
        <Box
      sx={{
        minHeight: "97vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: 0,
        padding: 0,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 4,
          borderRadius: 3,
          width: "100%",
          maxWidth: 400,
          bgcolor: "#161b22",
          textAlign: "center",
        }}
      >

                <Avatar sx={{ bgcolor: "transparent", mb: 1, mx: "auto"}}>
                    <GitHubIcon sx={{ fontSize: 46, color: "white" }} />
                </Avatar>

                <Typography variant="h5" sx={{ mb: 3, color: "white" }}>
                    Sign Up
                </Typography>

               
                <TextField
                    label="Username"
                    autoComplete="off"
                    type="text"
                    variant="outlined"
                    required
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)}
                    fullWidth
                    sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                            bgcolor: "#0d1117",
                            color: "white",
                        },
                        "& .MuiInputLabel-root": { color: "gray" },
                    }}
                    
                />

                <TextField
                    label="Email address"
                    type="text"
                    autoComplete="off"
                    variant="outlined"
                    required
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    fullWidth
                    sx={{
                        mb: 2,
                        "& .MuiOutlinedInput-root": {
                            bgcolor: "#0d1117",
                            color: "white",
                        },
                        "& .MuiInputLabel-root": { color: "gray" },
                    }}
                />
                <TextField
                    label="Password"
                    type="password"
                    variant="outlined"
                    required
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                    fullWidth
                    sx={{
                        mb: 3,
                        "& .MuiOutlinedInput-root": {
                            bgcolor: "#0d1117",
                            color: "white",
                        },
                        "& .MuiInputLabel-root": { color: "gray" },
                    }}
                />
                <p className="signupHeader">Bio</p>
                <textarea name="" id="bioTextarea" placeholder="Tell us a little bit about yourself"
                value={bio}
                    onChange={(e)=>setBio(e.target.value)}
                ></textarea>
                <p className="signupHeader">Company</p>
                <input type="text" id="organizationName"
                value={company}
                    onChange={(e)=>setCompany(e.target.value)}
                />
                <Button
                    variant="contained"
                    fullWidth
                    sx={{
                        bgcolor: "#238636",
                        "&:hover": { bgcolor: "#2ea043" },
                        fontWeight: "bold",
                    }}
                    disabled={loading}
                    onClick={handleSignup}
                >
                  {loading ? "Loading..." : "Signup"}
                </Button>

                <Box mt={3}>
                    <Typography variant="body2" sx={{ color: "gray" }}>
                        Already have an account?{" "}
                        <Link to="/auth" underline="hover" sx={{ color: "#58a6ff" }}>
                            Login
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
        
    );
}
