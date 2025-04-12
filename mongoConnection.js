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

export async function getSoftwareData() {
    let data = null;
    try {
        const connection = await client.connect();
        const database = await connection.db(process.env.SOFTWARE_DB_NAME);
        data = await database
            .collection(process.env.SOFTWARE_DB_DATA_COLLECTION)
            .find({
                softwareUsed: { $exists: true },
            })
            .toArray();
    } catch {
        console.log(
            `Failed to connect to ${process.env.SOFTWARE_DB_NAME}  whilst trying to get software data`,
        );
    }
    await client.close();
    return data;
}

export async function getFilteredSoftwareData(query) {
    let data = null;
    try {
        const queryObject = Object.assign({}, ...query);
        const connection = await client.connect();
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
    await client.close();
    return data;
}

export async function checkSoftwareAccessKeyValidity(keyToQuery) {
    let isValidKey = false;
    try {
        const connection = await client.connect();
        const database = await connection.db(process.env.SOFTWARE_DB_NAME);
        const result = await database
            .collection(process.env.SOFTWARE_DB_ACCESS_KEYS)
            .findOne({ key: keyToQuery });
        isValidKey = result != null;
    } catch {
        console.log(
            `Failed to connect to ${process.env.SOFTWARE_DB_NAME} whilst trying to check software key validity`,
        );
    }
    await client.close();
    return isValidKey;
}

export async function addSoftwareData(data) {
    let dataSuccessfullyAdded = false;
    try {
        const connection = await client.connect();
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
    await client.close();
    return dataSuccessfullyAdded;
}

export async function getAllLcsaData() {
    let data = null;
    try {
        const connection = await client.connect();
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
    
    await client.close();
    return data;
}

export async function getFilteredLcsaFields(query) {
    let data = null;
    try {
        const connection = await client.connect();
        const database = await connection.db(process.env.LCSA_DB_NAME);

        const orQuery = Object.keys(query).map(field => ({ [field]: { $exists: true } }));
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
    await client.close();
    return data;
}

export async function addLCSAData(data) {
    // TODO: confirm object structure is valid
    let dataSuccessfullyAdded = false;
    try {
        const connection = await client.connect();
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
    await client.close();
    return dataSuccessfullyAdded;
}

export async function updateLCSAAnalytic(analytic) {
    try {
        const connection = await client.connect();
        const database = await connection.db(process.env.LCSA_DB_NAME);
        await database
            .collection(process.env.LCSA_DB_ANALYTICS)
            .updateOne(
                { name: analytic },
                { $inc: { count: 1 } },
                { upsert: true }
            );
    } catch {
        console.log(
            `Failed to connect to ${process.env.LCSA_DB_NAME} whilst trying to add LCSA analytics data`,
        );
    }
    await client.close();
}
