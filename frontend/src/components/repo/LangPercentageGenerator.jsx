import { useEffect, useState } from "react";

const getRandomColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
};
export default function LangPercentageGenerator({ content }) {
    const [languages, setLanguages] = useState([]);
    const [colorMap, setColorMap] = useState({});

    useEffect(() => {
        const generatePercentage = async () => {
            if (content) {
                const files = content;
                const counts = {};

                files.forEach((file) => {
                    if (file?.fileName) {
                        const ext = file.fileName.split(".").pop();
                        if (ext) {
                            counts[ext] = (counts[ext] || 0) + 1;

                            if (!colorMap[ext]) {
                                setColorMap((prev) => ({
                                    ...prev,
                                    [ext]: getRandomColor(),
                                }));
                            }
                        }
                    }
                });

                const total = Object.values(counts).reduce((a, b) => a + b, 0);
                const langs = Object.entries(counts).map(([ext, count]) => ({
                    name: ext.toUpperCase(),
                    percent: ((count / total) * 100).toFixed(1),
                    color: colorMap[ext] || getRandomColor(),
                }));
                setLanguages(langs);
            }
        }
        generatePercentage();
    },[])

    return (
        <>
            {languages.length > 0 && (
                <div className="languages">
                    <h3>Languages</h3>
                    <div className="langBar" style={{ display: "flex", height: "10px", borderRadius: "5px", overflow: "hidden" }}>
                        {languages.map((lang, idx) => (
                            <div
                                key={idx}
                                style={{
                                    width: `${lang.percent}%`,
                                    backgroundColor: lang.color,
                                }}
                            />
                        ))}
                    </div>
                    <div className="langLegend" style={{ marginTop: "8px" }}>
                        {languages.map((lang, idx) => (
                            <div key={idx} style={{ display: "inline-block", marginRight: "15px", marginBottom: "0.5rem" }}>
                                <span style={{ color: lang.color }}>●</span> {lang.name} {lang.percent}%
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}