import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const databaseName = process.env.DB_NAME;
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
        const database = await connection.db(databaseName);
        data = await database
            .collection("softwareusers")
            .find({
                softwareUsed: { $exists: true },
            })
            .toArray();
    } catch {
        console.log(
            `Failed to connect -- ${databaseName}  whilst trying to get software data`,
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
        const database = await connection.db(databaseName);
        data = await database
            .collection("softwareusers")
            .find(queryObject)
            .toArray();
    } catch {
        console.log(
            `Failed to connect -- ${databaseName}  whilst trying to get software data`,
        );
    }
    await client.close();
    return data;
}

export async function addData(data) {
    let dataSuccessfullyAdded = false;
    try {
        const connection = await client.connect();
        const database = await connection.db(databaseName);
        await database.collection("softwareusers").insertOne({
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
            `Failed to connect -- ${databaseName} whilst trying to check key validity`,
        );
    }
    await client.close();
    return dataSuccessfullyAdded;
}

export async function checkAccessKeyValidity(keyToQuery) {
    let isValidKey = false;
    try {
        const connection = await client.connect();
        const database = await connection.db(databaseName);
        const result = await database
            .collection("accesskeys")
            .findOne({ key: keyToQuery });
        isValidKey = result != null;
    } catch {
        console.log(
            `Failed to connect -- ${databaseName} whilst trying to check key validity`,
        );
    }
    await client.close();
    return isValidKey;
}