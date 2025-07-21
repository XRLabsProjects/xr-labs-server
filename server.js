import express from "express";
import cors from "cors";
import {
    getSoftwareData,
    getFilteredSoftwareData,
    checkSoftwareAccessKeyValidity,
    addSoftwareData,
    getSoftwareSurveyCount,
    getSoftwareAnalyticsData,
    updateSoftwareAnalytic,
    getAllLcsaData,
    getFilteredLcsaFields,
    addLCSAData,
    getLCSAAnalyticsData,
    updateLCSAAnalytic,
} from "./mongoConnection.js";

// import isEmail from "validator/lib/isEmail.js";
// import nodemailer from "nodemailer";

const app = express();
const port = process.env.SERVER_PORT;

app.use(cors());
app.use(express.json());

app.get("/api/", (req, res) => {
    console.log("Server received call to path /");
    res.send("Server is ready");
});

/// SOFTWARE LEARNING WEBSITE ///
// FIXME: FILTER OUT ID IN THE MONGODB REQUEST (SEE LCSA EXAMPLES USING PROJECTION { _id: 0 })
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

// FIXME: RENAME TO MORE ACCURATELY REFLECT WHAT THIS FILTERING DOES
    // Get all data for entries that match specific requirements
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

app.post("/api/checkSoftwareAccessKey", async (req, res) => {
    console.log("Server received call to path /api/checkSoftwareAccessKey");
    const isKeyValid = await checkSoftwareAccessKeyValidity(
        req.body.key.toUpperCase(),
        req.body.isAdmin,
    );
    res.send(isKeyValid);
});

app.post("/api/addSoftwareData", async (req, res) => {
    console.log("Server received call to path /api/addSoftwareData");
    const response = await addSoftwareData(req.body);
    res.send(true);
});

app.get("/api/getSoftwareSurveyCount", async (req, res) => {
    console.log("Server received call to path /api/getSoftwareSurveyCount");
    const data = await getSoftwareSurveyCount();
    console.log(data);
    res.send(data);
});

app.get("/api/getSoftwareAnalyticsData", async (req, res) => {
    console.log("Server received call to path /api/getLcsaAnalyticsData");
    const data = await getSoftwareAnalyticsData();
    res.send(data);
});

app.post("/api/updateSoftwareAnalytics", async (req, res) => {
    const analytic = req.body.analytic;
    console.log("Server received call to path /api/updateSoftwareAnalytics for analytic " + analytic);
    if (!analytic || analytic.length <= 0) {
        res.send(false);
    }
    const response = await updateSoftwareAnalytic(analytic);
    res.send(response);
});

// app.post("/api/sendEmail", async (req, res) => {
//     console.log("Server received call to path /api/sendEmail");
//     const { name, email, message } = req.body;
//     if (!name || !email || !message || !isEmail(email)) {
//         res.send(false);
//     } else {
//         const transporter = nodemailer.createTransport({
//             host: process.env.SMTP_HOST,
//             port: process.env.SMTP_PORT,
//             secure: false, // use false for STARTTLS; true for SSL on port 465
//             auth: {
//                 user: process.env.SMTP_USER,
//                 pass: process.env.SMTP_PASS,
//             },
//         });
//
//         const mailOptions = {
//             from: process.env.EMAIL_FROM,
//             to: process.env.EMAIL_TO,
//             replyTo: email,
//             subject: `Software Learning Contact Form: ${name}`,
//             text: `Sender: ${name}\nEmail: ${email}\n\nContents: ${message}`,
//         };
//
//         await transporter.sendMail(mailOptions, (error, info) => {
//             if (error) {
//                 console.log("Failed to send email due to server error");
//                 res.send(false);
//             } else {
//                 console.log("Successfully sent email");
//                 return res.send(true);
//             }
//         });
//
//         res.send(true);
//     }
// });



/// LCSA TRACKER WEBSITE ///

app.get("/api/getAllLcsaQuestionnaireData", async (req, res) => {
    console.log("Server received call to path /api/getAllLcsaQuestionnaireData");
    const data = await getAllLcsaData();
    res.send(data);
});

app.post("/api/getFilteredLcsaQuestionnaireFields", async (req, res) => {
    console.log("Server received call to path /api/getFilteredLcsaQuestionnaireFields");
    const data = await getFilteredLcsaFields(req.body);
    res.send(data);
});

app.post("/api/checkLcsaAccessKey", async (req, res) => {
    console.log("Server received call to path /api/checkLcsaAccessKey");
    // const isKeyValid = await checkSoftwareAccessKeyValidity(
    //     req.body.key.toUpperCase(),
    // );
    // res.send(isKeyValid);
});

app.post("/api/addLcsaQuestionnaireData", async (req, res) => {
    console.log("Server received call to path /api/addLcsaQuestionnaireData");
    const data = req.body;
    
    // defines the structure for data in the database -- to be honest this code is very loose
    const inputData = {
        ageGroup: data.ageGroup,
        experience: data.experienceWithLCA,
        gender: data.gender,
        occupation: data.occupation,
        country: data.country,
        easyToUse: data.easyToUseScale,
        quickToLearn: data.quickToLearnScale,
        engaging: data.engagingScale,
        enjoyment: data.enjoymentScale,
        limitationsAndBarriers: data.limitationsAndBarriers,
        opportunitiesAndPotential: data.opportunitiesAndPotential,
        time: data.time,
    }
    const response = await addLCSAData(inputData);
    res.send(response);
});

app.get("/api/getLcsaAnalyticsData", async (req, res) => {
    console.log("Server received call to path /api/getLcsaAnalyticsData");
    const data = await getLCSAAnalyticsData();
    res.send(data);
});

app.post("/api/updateLcsaAnalytics", async (req, res) => {
    const analytic = req.body.analytic;
    console.log("Server received call to path /api/updateLcsaAnalytics for analytic " + analytic);
    if (!analytic || analytic.length <= 0) {
        res.send(false);
    }
    const response = await updateLCSAAnalytic(analytic);
    res.send(response);
});

/// GLOBAL ///

app.listen(port, () => {
    console.log(`Server listening at port: ${port}`);
});
