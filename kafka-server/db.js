import { MongoClient } from "mongodb";
const client = new MongoClient(
    "mongodb+srv://alexandreapinheirodias:deybKJEX9R9wGwo9@beachboys.qjpl1.mongodb.net/?retryWrites=true&w=majority&appName=BeachBoys",
    {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
    },
);
let conn;
try {
    conn = await client.connect();
} catch (e) {
    console.error(e);
}
export default conn.db("database");
