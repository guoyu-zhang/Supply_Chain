import db from "./db";

const address = "0.0.0.0";
const PORT = 3001;

const app = express();

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("database").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!",
        );
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

app.use(
    cors({
        origin: "http://localhost:5173",
        methods: "GET",
        allowedHeaders: ["Content-Type"],
    }),
);

//import express from "express";
//import cors from "cors";
//import { Kafka } from "kafkajs";
//const kafka = new Kafka({
//	clientId: "my-app",
//	brokers: ["localhost:9092"],
//});
//
//const consumer = kafka.consumer({ groupId: "react-group" });
//
//const clients = [];
//
//async function startConsumer() {
//	await consumer.connect();
//	await consumer.subscribe({ topic: "product-purchases", fromBeginning: true });
//
//	await consumer.run({
//		eachMessage: async ({ topic, partition, message }) => {
//			const msg = message.value.toString();
//			console.log(`Received message: ${msg}`);
//
//			clients.forEach((client) => client.write(`data: ${msg}\n\n`));
//		},
//	});
//}
//
//startConsumer().catch(console.error);
//
//app.get("/products/:sku", (req, res) => {});
//
//app.get("/stream", (req, res) => {
//	res.setHeader("Content-Type", "text/event-stream");
//	res.setHeader("Cache-Control", "no-cache");
//	res.setHeader("Connection", "keep-alive");
//
//	clients.push(res);
//
//	req.on("close", () => {
//		clients.splice(clients.indexOf(res), 1);
//		res.end();
//	});
//});
//
//app.listen(port, () => console.log(`Kafka server listening on port ${port}`));
