import HeatMap from "@uiw/react-heat-map";
import { useState, useEffect } from "react";

const generateActivityData = (startDate, endDate) =>{
    const data = [];
    let currentDate = new Date(startDate);
    let end = new Date(endDate);

    while(currentDate<=end) {
        const count = Math.floor(Math.random()*50);
        data.push({
            date: currentDate.toISOString().split("T")[0],
            count: count,
        });
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
};

const getPanelColor = (maxCount) =>{
    const colors = {};
    for(let i=0; i<= maxCount; i++) {
        const greenValue = Math.floor((i/maxCount) * 255);
        colors[i] = `rgb(0, ${greenValue},0)`;
    }

    return colors;
};

const HeatMapProfile = () =>{
    const [activityData, setActivityData] = useState([]);
    const [panelColors, setPanelColors] = useState({});

    useEffect(()=>{
        const fetchData = async () =>{
            const startDate = "2001-01-01";
            const endDate = "2001-01-31";
            const data = generateActivityData(startDate, endDate);
            setActivityData(data);

            const maxCount = Math.max(...data.map((d)=>d.count));
            setPanelColors(getPanelColor(maxCount));

        };
        fetchData();
    },[]);
    
    return (
        <div>
            <HeatMap
            className="HeatMapProfile"
            style={{width:"100%", maxWidth: "1000px", height: "800px",color:"white"}}
            value={activityData}
            weekLabels={["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]}
            startDate={new Date('2001-01-01')}
            rectSize={12}
            space={2}
            rectProps={{
                rx: 2.5
            }}
            panelColors={panelColors}       
            />
        </div>
    )
}

export default HeatMapProfile;