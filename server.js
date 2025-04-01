import express from "express";
import cors from "cors";
import {
    getSoftwareData,
    getFilteredSoftwareData,
    checkAccessKeyValidity,
    addData,
} from "./mongoConnection.js";

const port = process.env.SERVER_PORT;
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    console.log("Server received call to path /");
    res.send("This is the default server path, it comes from nothing and leads to nothing. It's purpose is to exist and to test. That is all.");
});

app.get("/api/getSoftwareData", async (req, res) => {
    console.log("Server received call to path /api/getSoftwareData");
    const data = await getSoftwareData();
    const outputData = [];
    data.forEach((doc) => {
        outputData.push({
            companyName: doc.companyName,
            capacityForUse: doc.capacityForUse,
            country: doc.country,
            field: doc.field,
            softwareUsed: doc.softwareUsed,
            otherSoftwareUsed: doc.otherSoftwareUsed,
            year: doc.year,
        });
    });
    res.send(outputData);
});

app.post("/api/getFilteredSoftwareData", async (req, res) => {
    console.log("Server received call to path /api/getFilteredSoftwareData");
    const data = await getFilteredSoftwareData(req.body);
    const outputData = [];
    data.forEach((doc) => {
        outputData.push({
            companyName: doc.companyName,
            capacityForUse: doc.capacityForUse,
            country: doc.country,
            field: doc.field,
            softwareUsed: doc.softwareUsed,
            otherSoftwareUsed: doc.otherSoftwareUsed,
            year: doc.year,
        });
    });
    res.send(outputData);
});

app.post("/api/addData", async (req, res) => {
    console.log("Server received call to path /api/addData");
    const response = await addData(req.body);
    res.send(true);
});

app.post("/api/checkAccessKey", async (req, res) => {
    console.log("Server received call to path /api/checkAccessKey");
    const isKeyValid = await checkAccessKeyValidity(req.body.key.toUpperCase());
    res.send(isKeyValid);
});

app.listen(port, () => {
    console.log(`Server listening at port: ${port}`);
});