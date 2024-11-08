import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import { randomFill } from "node:crypto";
import { promises as fs } from "node:fs";

const uri =
    "mongodb+srv://alexandreapinheirodias:deybKJEX9R9wGwo9@beachboys.qjpl1.mongodb.net/?retryWrites=true&w=majority&appName=BeachBoys";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function generateSKU(name) {
    return name.toLowerCase().replace(/\s+/g, "-");
}

async function readLocation() {
    try {
        const data = await fs.readFile("locations.json", "utf8");
        const jsonData = JSON.parse(data);
        return jsonData; // Return the parsed JSON data
    } catch (err) {
        console.error("Error reading file:", err);
        return null; // Return null in case of an error
    }
}

async function readProduct() {
    try {
        const data = await fs.readFile("message.json", "utf8");
        const jsonData = JSON.parse(data);
        return jsonData; // Return the parsed JSON data
    } catch (err) {
        console.error("Error reading file:", err);
        return null; // Return null in case of an error
    }
}

async function readInc() {
    try {
        const data = await fs.readFile("inc.json", "utf8");
        const jsonData = JSON.parse(data);
        return jsonData; // Return the parsed JSON data
    } catch (err) {
        console.error("Error reading file:", err);
        return null; // Return null in case of an error
    }
}

const getRandomItem = (array) => {
    //console.log(array)
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
};

const options = ["boat", "plane", "rail", "truck"];

async function run() {
    try {
        console.log("connecting...");
        const database = client.db("database");

        const supplier = database.collection("suppliers");
        const inventory = database.collection("inventory");
        const warehouses = database.collection("warehouses");
        const orders = database.collection("orders");

        console.log("dropping databases");
        await supplier.drop();
        await inventory.drop();
        await warehouses.drop();
        await orders.drop();
        console.log("done");

        const locationData = await readLocation();
        const productData = await readProduct();
        const incData = await readInc();
        // console.log(locationData);

        for (const obj of productData) {
            const product_name = Object.keys(obj)[0];
            const product_parts = Object.values(obj)[0];

            const ind = getRandomInt(1, 100);

            // create random supplier
            let results = await supplier.findOne(
                { name: incData[ind].name },
                { projection: { _id: 1 } },
            );
            const supplier_id = results
                ? results._id
                : (
                      await supplier.insertOne({
                          name: incData[ind].name,
                          warehouses: [],
                      })
                  ).insertedId;

            // Inventory connect and try find if the product exists
            results = await inventory.findOne({
                sku: generateSKU(product_name),
            });
            // if already found, go to next product
            if (results) {
                continue;
            }
            const inventoryResult = await inventory.insertOne({
                sku: generateSKU(product_name),
                name: product_name,
                amount: getRandomInt(1, 100),
                parts: product_parts,
                supplier: supplier_id,
                cost: Math.floor(Math.random() * 90_000) + 150,
            });

            const inventory_id = inventoryResult.insertedId;

            //if (!results) {
            //    const supplierResult = await supplier.insertOne({
            //        name: incData[ind].name,
            //    });
            //    supplier_id =
            //}

            let warehouses_id;
            console.log("while true for warehouse location");
            while (true) {
                const randomLocation = getRandomItem(locationData);

                results = await warehouses.findOne({
                    location: {
                        lng: randomLocation.Longitude,
                        lat: randomLocation.Latitude,
                    },
                });

                if (!results) {
                    const warehouseResult = await warehouses.insertOne({
                        location: {
                            lng: randomLocation.Longitude,
                            lat: randomLocation.Latitude,
                        },
                        supplier: supplier_id,
                        products: [inventory_id],
                    });

                    warehouses_id = warehouseResult.insertedId;
                    break;
                }
            }

            // make a random order
            const cancelled = Math.random() < 0.1;
            const returned = cancelled ? false : Math.random() < 0.1;

            const ordersResult = await orders.insertOne({
                amount: getRandomInt(1, 100),
                delivery: {
                    completed_at: Date.now(),
                    mode: options[Math.floor(Math.random() * options.length)],
                    cancelled,
                },
                returned,
                warehouse_id: warehouses_id,
                product_id: inventory_id,
            });

            //console.log(product_name);
            //console.log(supplier_id);
            //const result = await inventory.updateOne(
            //    {
            //        name: product_name,
            //    },
            //    {
            //        $set: { supplier: supplier_id },
            //    },
            //);
            //
            // warehouses = database.collection('warehouses');
            // await warehouses.updateOne({
            // 	warehouses:
            // })
        }

        const items = await supplier
            .find({}, { projection: { _id: 1 } })
            .toArray();
        const ids = items.map((item) => item._id); // Extract `_id` values

        // console.log(ids); // Outputs an array of _id values

        const supplier_ids = new Map();
        for (const sup_id of ids) {
            supplier_ids.set(sup_id.toString(), []);
        }

        // Use `find()` to get a cursor
        const cursor = warehouses.find({});

        // Use `for...await...of` to iterate through each document
        for await (const doc of cursor) {
            // console.log(doc.supplier)

            if (!supplier_ids.has(doc.supplier.toString())) {
                supplier_ids.set(doc.supplier.toString(), []); // Initialize with an empty array if not set
            }
            // console.log(supplier_ids.entries().next().value[0])
            // // console.log(supplier_ids)
            // console.log(doc.supplier.toString())
            // break

            supplier_ids.get(doc.supplier.toString()).push(doc._id);
            console.log(supplier_ids.get(doc.supplier.toString()));
        }

        console.log("updating suppliers");
        for (const [key, val] of supplier_ids) {
            //    console.log(`Key: ${key}, Value: ${val}`);
            //}
            //for supplier_ids(async (val, key, map) => {
            console.log(`doing for ${key}: ${val}`);
            await supplier.updateOne(
                { _id: ObjectId.createFromHexString(key) }, // Filter to find the document
                { $push: { warehouses: { $each: val } } }, // Add the new field
            );
            console.log(`done for ${key}: ${val}`);
        }
        console.log("completed updating suppliers");
        console.log(supplier_ids);

        // Looping to add parts as references to inventory
        for (const obj of productData) {
            const product_name = Object.keys(obj)[0];
            const product_parts = Object.values(obj)[0];
            const deps = await inventory
                .find({ name: { $in: product_parts } })
                .toArray();
            const ids = deps.map((doc) => doc._id);
            await inventory.updateOne(
                { name: product_name },
                { $set: { parts: ids } },
            );
        }

        // // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // // Send a ping to confirm a successful connection
        // await client.db("database").);
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!",
        );
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

// db.inventory.updateOne(
//     { sku: "advanced-drone" },  // Filter to find the document
//     { $set: { supplier: "Elite Supplier Co." } }  // Add the new field
// );

// db.inventory.updateOne(
//     { sku: "advanced-drone" },
//     { $set: { specs: { range: "10km", batteryLife: "2 hours" } } }
// );

// db.inventory.updateOne(
//     { sku: "advanced-drone" },
//     { $set: { parts: [ObjectId("partId1"), ObjectId("partId2")] } }
// );

// db.inventory.updateOne(
//     { sku: "advanced-drone" },
//     {
//         $set: {
//             weight: "1.5kg",
//             color: "black",
//             supplier: "Elite Supplier Co."
//         }
//     }
// );
