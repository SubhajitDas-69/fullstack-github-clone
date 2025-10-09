import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

export default function SearchFile({ Repository, cssClassName }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);

        useEffect(() => {
            if (!Repository) return;
            if (searchQuery.trim() === "") {
                setSearchResults([]);
            } else {
                const filteredRepo = Repository.content.filter(
                    (item) =>
                        item?.fileName?.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setSearchResults(filteredRepo);
                console.log(filteredRepo);

            }
        }, [searchQuery, Repository]);

        function handleSearch() {
            setSearchQuery("");
        }

        if (!Repository) {
            return <p>Loading...</p>;
        }


        return (
            <>
                <input type="text" placeholder="Go to file" value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)} className="contentSidebarSearch"/>
                {searchResults.length != 0 ? (
                    <div className={cssClassName}>
                        {searchResults.map((file) => {
                            return (
                                <div key={file.commitId} className="searchResult">
                                    <Link to={`/fileContent/${Repository._id}/${file.commitId}/file/${file.fileName}`} className="fileLink"
                                    // /fileContent/:repoId/:commitId/file/:fileName
                                    onClick={handleSearch}>
                                        <div className="searchFileName">
                                            <InsertDriveFileOutlinedIcon
                                                sx={{ fontSize: 20, fill: "#d0d0d0"  }}
                                            />
                                            {file.fileName}
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    null
                )
                }
            </>
        )
    }