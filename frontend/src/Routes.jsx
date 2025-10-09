import React, {useEffect} from "react";
import {useNavigate, useRoutes} from 'react-router-dom';
import { setupInterceptors } from "./Api";

import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import NewRepo from "./components/repo/NewRepo";
import RepoContent from "./components/repo/RepoContent";
import CommitViewer from "./components/repo/CommitViewer";

import { useAuth } from "./authContext";
import CreateFile from "./components/AddFile/CreateFile";
import ViewRepositories from "./components/user/ViewRepositories";
import Commits from "./components/repo/Commits";
import Stars from "./components/user/Stars";
import Issues from "./components/issue/Issues";
import NewIssue from "./components/issue/NewIssue";
import ViewIssue from "./components/issue/ViewIssue";
import CommitList from "./components/repo/CommitList";
import Followers from "./components/user/Followers";
import Following from "./components/user/Following";
import Settings from "./components/user/Settings";
import ProfileSettings from "./components/user/ProfileSettings";
import ProfileDeleted from "./components/user/ProfileDeleted";

const ProjectRoutes = ()=>{
    const {currentUser, setCurrentUser} = useAuth();
    const navigate = useNavigate();

    useEffect(()=>{
        setupInterceptors(navigate);
        
        const userIdFormStorage = localStorage.getItem("userId");
        if(userIdFormStorage && !currentUser) {
            setCurrentUser(userIdFormStorage);
        }

        if(!userIdFormStorage && !["/auth", "/signup"].includes(window.location.pathname)) {
            navigate("/auth");
        }
        if(userIdFormStorage && window.location.pathname == '/auth') {
            navigate("/");
        }
    },[currentUser, navigate, setCurrentUser]);
    
    let element = useRoutes([
        {
            path:"/",
            element: <Dashboard/>
        },
        {
            path:"/auth",
            element: <Login/>
        },
        {
            path:"/signup",
            element: <Signup/>
        },
        {
            path:"/profile/:userId",
            element: <Profile/>
        },
        {
            path:"/create",
            element: <NewRepo/>
        },
          {
            path:"/GitHub/CurrentUser/:userId/repo/:repoId",
            element: <RepoContent/>
        },
        {
            path:"/fileContent/:repoId/:commitId/file/:fileName",
            element: <CommitViewer/>
        },
         {
            path:"/repo/:repoId/file/createFile",
            element: <CreateFile/>
        },
        
         {
            path:"/Allrepo/user/:userId",
            element: <ViewRepositories/>
        },
        {
            path:"/view/:repoName/:repoId/allCommits/:commitId",
            element: <Commits/>
        },
        {
            path:"/stars/:userId",
            element: <Stars/>
        },
        {
            path:"/Issues/:repoId",
            element: <Issues/>
        },
        {
            path:"/create/issue/:repoId",
            element: <NewIssue/>
        },
        {
            path:"/viewIssue/:issueId/repo/:repoId",
            element: <ViewIssue/>
        },
        {
            path:"/GitHub/CurrentUser/:userId/repo/:repoId/commits",
            element: <CommitList/>
        },
        {
            path:"/followers/:userId",
            element: <Followers/>
        },
        {
            path:"/following/:userId",
            element: <Following/>
        },
        {
            path:"/:repoId/settings",
            element: <Settings/>
        },
        
        {
            path:"/settings/profile",
            element: <ProfileSettings/>
        },
        {
            path:"/account/delete",
            element: <ProfileDeleted/>
        },
    ]);

    return element;
}

export default ProjectRoutes;