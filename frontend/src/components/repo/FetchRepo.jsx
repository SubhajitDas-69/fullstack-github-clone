import Navbar from "../Navbar";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { Avatar } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import api from "../../Api";

export default function FetchRepo({repoId}) {
    const [repo, setRepo] = useState(null);
     useEffect(() => {
    const fetchRepoContent = async () => {
      if (repoId) {
        try {
          const response = await api.get(`/repo/${repoId}`);
          setRepo(response.data);
        } catch (err) {
          console.error("Cannot fetch repo details: ", err);
        }
      }
    };
    fetchRepoContent();
  }, [repoId]);

    return (
        <>
        <Navbar username={repo.owner.username} repoName={repo.name} />

      <div className="repoHeader">
        <Avatar id="profile" />
        <h2 className="repoName">{repo.name}</h2>
        <b id="repoVisibility">{repo.visibility}</b>
      </div>

      <div className="main">
        {/* file list */}
        <div id="fileContent">
          <button id="addFilebtn">Add file</button>
          <div id="files">
            {repo.content?.map((item) => (
              <div key={item._id} className="trMain">
                <div className="tbData">
                  <div className="fileList">
                    <InsertDriveFileOutlinedIcon sx={{ fontSize: 20, color: "white" }} />
                    <Link
                      to={`/repo/${repo.name}/${item.commitId}/file/${item.fileName}`}
                      className="fileLink"
                    >
                      {item.fileName}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
        </>
    )
}