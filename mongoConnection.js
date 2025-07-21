import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.DB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
const clientPromise = client.connect().catch((err) => {
    // TODO: open new connection
    console.error("Connection crashed: " + err);
});


async function getAnalyticsData(databaseName, collectionName) {
    let data = null;
    try {
        const connection = await clientPromise;
        const database = connection.db(databaseName);
        const collection = database.collection(collectionName);

        data = collection
            .find({ })
            .project( { _id: 0 } )
            .toArray();
    } catch {
        console.log(
            `Failed to connect to ${databaseName} whilst trying to get analytics data`,
        );
        return false;
    }

    return data;
}

async function addAnalyticsData(data, databaseName, collectionName) {
    try {
        const connection = await clientPromise;
        const database = connection.db(databaseName);
        const collection = database.collection(collectionName);

        const currentDate = new Date();
        const monthYear = `${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getFullYear()}`;

        // checks if existing valid data entry exists
        const result = await collection.updateOne(
            {
                name: data,
                "monthYearData.monthYear": monthYear,
            },
            {
                $inc: { "monthYearData.$.count": 1 },
            }
        );

        // creates new data entry if valid entry didn't exist
        if (result.matchedCount === 0) {
            await collection.updateOne(
                { name: data },
                {
                    $setOnInsert: { name: data },
                    // add monthYear object with count to an array of month years
                    $push: {
                        monthYearData: {
                            monthYear: monthYear,
                            count: 1,
                        },
                    },
                },
                { upsert: true }
            );
        }
    } catch {
        console.log(
            `Failed to connect to ${databaseName} whilst trying to add analytics data`,
        );
        return false;
    }
    return true;
}

// TODO: Remove repeated code
export async function getSoftwareSurveyCount() {
    let data = null;
    try {
        const connection = await clientPromise;
        const database = await connection.db(process.env.SOFTWARE_DB_NAME);
        data = await database
            .collection(process.env.SOFTWARE_DB_DATA_COLLECTION)
            .countDocuments({
                softwareUsed: { $exists: true },
            });
    } catch {
        console.log(
            `Failed to connect to ${process.env.SOFTWARE_DB_NAME} whilst trying to get entries count`,
        );
    }
    console.log(data);
    return data;
}

export async function getSoftwareData() {
    let data = null;
    try {
        const connection = await clientPromise;
        const database = await connection.db(process.env.SOFTWARE_DB_NAME);
        data = await database
            .collection(process.env.SOFTWARE_DB_DATA_COLLECTION)
            .find({
                softwareUsed: { $exists: true },
            })
            .toArray();
    } catch {
        console.log(
            `Failed to connect to ${process.env.SOFTWARE_DB_NAME} whilst trying to get software data`,
        );
    }
    return data;
}

export async function getFilteredSoftwareData(query) {
    let data = null;
    try {
        const queryObject = Object.assign({}, ...query);
        const connection = await clientPromise;
        const database = await connection.db(process.env.SOFTWARE_DB_NAME);
        data = await database
            .collection(process.env.SOFTWARE_DB_DATA_COLLECTION)
            .find(queryObject)
            .toArray();
    } catch {
        console.log(
            `Failed to connect to ${process.env.SOFTWARE_DB_NAME}  whilst trying to get filtered software data`,
        );
    }
    return data;
}

export async function checkSoftwareAccessKeyValidity(keyToQuery, isAdmin) {
    let isValidKey = false;
    try {
        const connection = await clientPromise;
        const database = await connection.db(process.env.SOFTWARE_DB_NAME);
        const result = await database
            .collection(isAdmin ? process.env.SOFTWARE_DB_ADMIN_KEYS : process.env.SOFTWARE_DB_ACCESS_KEYS)
            .findOne({ key: keyToQuery });
        isValidKey = result != null;
    } catch {
        console.log(
            `Failed to connect to ${process.env.SOFTWARE_DB_NAME} whilst trying to check software key validity`,
        );
    }
    return isValidKey;
}

export async function addSoftwareData(data) {
    let dataSuccessfullyAdded = false;
    try {
        const connection = await clientPromise;
        const database = await connection.db(process.env.SOFTWARE_DB_NAME);
        await database
            .collection(process.env.SOFTWARE_DB_DATA_COLLECTION)
            .insertOne({
                companyName: data.companyName,
                capacityForUse: data.capacityForUse,
                country: data.country,
                field: data.field,
                softwareUsed: data.softwareUsed,
                otherSoftwareUsed: data.otherSoftwareUsed,
                year: data.year,
            });
        dataSuccessfullyAdded = true;
    } catch {
        console.log(
            `Failed to connect to ${process.env.SOFTWARE_DB_NAME} whilst trying to add software data`,
        );
    }
    return dataSuccessfullyAdded;
}

export async function getSoftwareAnalyticsData() {
    return getAnalyticsData(process.env.SOFTWARE_DB_NAME, process.env.SOFTWARE_DB_ANALYTICS);
}

export async function updateSoftwareAnalytic(data) {
    return addAnalyticsData(data, process.env.SOFTWARE_DB_NAME, process.env.SOFTWARE_DB_ANALYTICS);
}

export async function getAllLcsaData() {
    let data = null;
    try {
        const connection = await clientPromise;
        const database = await connection.db(process.env.LCSA_DB_NAME);

        data = await database
            .collection(process.env.LCSA_DB_DATA_COLLECTION)
            .find({ })
            .project( { _id: 0 } )
            .toArray();
    } catch {
        console.log(
            `Failed to connect to ${process.env.LCSA_DB_NAME}  whilst trying to get all LCSA data`,
        );
    }
    
    return data;
}

export async function getFilteredLcsaFields(query) {
    let data = null;
    try {
        const connection = await clientPromise;
        const database = await connection.db(process.env.LCSA_DB_NAME);
        
        // Checks if each field in the query exists
        const orQuery = Object.keys(query).map(field => ({ [field]: { $exists: true } }));
        
        // Only include specified fields in the result (not including id)
        const projection = Object.keys(query).reduce((acc, field) => {
            acc[field] = 1;
            return acc;
        }, { _id: 0 });

        data = await database
            .collection(process.env.LCSA_DB_DATA_COLLECTION)
            .find({ $or: orQuery })
            .project( projection )
            .toArray();
    } catch {
        console.log(
            `Failed to connect to ${process.env.LCSA_DB_NAME}  whilst trying to get filtered LCSA fields`,
        );
    }
    return data;
}

export async function addLCSAData(data) {
    // TODO: confirm object structure is valid
    let dataSuccessfullyAdded = false;
    try {
        const connection = await clientPromise;
        const database = await connection.db(process.env.LCSA_DB_NAME);
        await database
            .collection(process.env.LCSA_DB_DATA_COLLECTION)
            .insertOne(data);
        dataSuccessfullyAdded = true;
    } catch {
        console.log(
            `Failed to connect to ${process.env.LCSA_DB_NAME} whilst trying to add LCSA data`,
        );
    }
    return dataSuccessfullyAdded;
}

export async function getLCSAAnalyticsData() {
    return getAnalyticsData(process.env.LCSA_DB_NAME, process.env.LCSA_DB_ANALYTICS);
}

export async function updateLCSAAnalytic(data) {
    return addAnalyticsData(data, process.env.LCSA_DB_NAME, process.env.LCSA_DB_ANALYTICS);
}
