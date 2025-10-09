import Navbar from "../Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import "./Settings.css";
import api from "../../Api";
import { useEffect, useState } from "react";

export default function Settings() {
    const { repoId } = useParams();
    const [repo, setRepo] = useState(null);
    const [draftRepo, setDraftRepo] = useState(null);
    const [showVisibilityBox, setShowVisibilityBox] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        const fetchRepo = async () => {
            try {
                const res = await api.get(`/repo/${repoId}`);
                setRepo(res.data);
                setDraftRepo(res.data);
            } catch (e) {
                console.log("Error during fetch repository!", e);
            }
        };
        fetchRepo();
    }, [repoId]);

    const handleEditRepo = async () => {
        try {
            const res = await api.put(`/repo/update/${repoId}`, {
                name: repo.name,
                description: draftRepo.description,
            });
            setRepo(res.data.repository);
            setDraftRepo(res.data.repository);
            navigate(`/GitHub/CurrentUser/${userId}/repo/${repoId}`);
        } catch (e) {
            console.log("Error during updating repository: ", e);
        }
    };
    const editRepoVisibility = async (newVisibility) => {
        try {
            const res = await api.patch(`/repo/toggle/${repoId}`,{
                visibility: newVisibility
            })
            setRepo(res.data.repository);
            setShowVisibilityBox(false);
        }catch(e) {
            console.log("Error during updating repository visibility: ", e);
        }
    }

    const handleRepoDelete = async () => {
        setDeleteLoading(true);
        try{
            await api.delete(`/repo/delete/${repoId}`);
            navigate(`/Allrepo/user/${userId}`);
        }catch(e) {
            console.log("Error during deleting reopository!", e);
        }finally{
            setDeleteLoading(false);
        }
    }

    const handleCancelDescription = () => {
        setDraftRepo((prev) => ({ ...prev, description: repo.description }));
    };

    return (
        <>
            <Navbar repoId={repoId} />
            <div className="settingsContainer">
                <h2>General</h2>
                <div className="editSection">
                    <p>Repository name</p>
                    <div className="repoNameEditSection">
                        <input
                            type="text"
                            className="repoRenameInput"
                            value={repo?.name || ""}
                            onChange={(e) =>
                                setRepo((prev) => ({ ...prev, name: e.target.value }))
                            }
                        />
                        <button
                            className="renameRepoBtn"
                            onClick={handleEditRepo}
                            disabled={!repo?.name || repo?.name.trim() === ""}
                        >
                            Rename
                        </button>
                    </div>

                    <p>Description</p>
                    <textarea
                        id="repoDescriptionEdit"
                        value={draftRepo?.description || ""}
                        onChange={(e) =>
                            setDraftRepo((prev) => ({
                                ...prev,
                                description: e.target.value,
                            }))
                        }
                    ></textarea>

                    <Button className="renameRepoBtn editdesBtn" onClick={handleEditRepo}>
                        Edit description
                    </Button>
                    <Button className="cancelEditDesBtn" onClick={handleCancelDescription}>
                        Cancel
                    </Button>
                    <h2 id="dangerZoneHeading">Danger Zone</h2>
                    <div id="dengerZoneContainer">
                        <div className="dengerZoneSection firstsection">
                            <div>
                                <p>Change repository visibility</p>
                                <span>This repository is currently {repo?.visibility}</span>
                            </div>
                            <button
                                className="dengerZoneBtn"
                                onClick={() => setShowVisibilityBox((prev) => !prev)}
                            >
                                Change visibility
                            </button>
                        </div>
                        {showVisibilityBox && (
                            <div className="visibilityBox"
                                onClick={() =>
                                    editRepoVisibility(repo?.visibility === "public" ? "private" : "public")
                                }
                            >
                                Change to {repo?.visibility === "public" ? "private" : "public"}
                            </div>
                        )}

                        <hr id="dengerZoneSeperater" />

                        <div className="dengerZoneSection">
                            <div>
                                <p>Delete this repository</p>
                                <span>
                                    Once you delete a repository, there is no going back. Please
                                    be certain.
                                </span>
                            </div>
                            <button className="dengerZoneBtn"
                            onClick={handleRepoDelete}
                            disabled={deleteLoading}
                            >
                                {deleteLoading ? "deleting repository..." : "Delete this repository"}
                               
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
