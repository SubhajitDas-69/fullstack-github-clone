import React, { useEffect, useState } from "react";
import { useAuth } from "../../authContext";
import axios from 'axios';
import {Box, Button, TextField, Typography, Paper, Avatar} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Link } from "react-router-dom";

export default function Login() {
    // useEffect(()=>{
    //     localStorage.removeItem("token");
    //     localStorage.removeItem("userId");
    //     setCurrentUser(null);

    // });

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const {setCurrentUser} = useAuth();

    const handleLogin = async(e)=>{
        e.preventDefault();

    try{
      setLoading(true);
      const res = await axios.post("http://localhost:3000/login",{
        email: email,
        password: password,
      });
       localStorage.setItem("token",res.data.token);
      localStorage.setItem("userId",res.data.userId);

      setCurrentUser(res.data.userId);
      setLoading(false);

      window.location.href = '/';
    }catch(err){
        console.error(err);
      alert("Login Falied!");
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
                    Login
                </Typography>


                <TextField
                    label="Email address"
                    type="email"
                    variant="outlined"
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

                <Button
                    variant="contained"
                    fullWidth
                    disabled={loading}
                    onClick={handleLogin}
                    sx={{
                        bgcolor: "#238636",
                        "&:hover": { bgcolor: "#2ea043" },
                        fontWeight: "bold",
                    }}
                >
                    {loading ? "loading..." : "Login"}
                </Button>

                <Box mt={3}>
                    <Typography variant="body2" sx={{ color: "gray" }}>
                        Don't have an account?{" "}
                        <Link to="/signup" underline="hover" sx={{ color: "#58a6ff" }}>
                            Sign Up
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}
