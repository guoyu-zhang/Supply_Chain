import fs from "fs";
import path from "path";
import { Kafka } from "kafkajs";

const kafka = new Kafka({
	clientId: "my-app",
	brokers: ["localhost:9092"],
});

const producer = kafka.producer();

const filePath = path.join(__dirname, "events.json");

function getRandomDelay(min = 500, max = 3000) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function publishEvents() {
	await producer.connect();

	const rawData = fs.readFileSync(filePath, "utf8");
	const events = JSON.parse(rawData);

	for (const event of events) {
		await producer.send({
			topic: "product-purchases",
			messages: [{ value: JSON.stringify(event) }],
		});
		console.log("Published event:", event);

		// Add a random delay before sending the next message
		const waitTime = getRandomDelay();
		console.log(
			`Waiting for ${waitTime} ms before sending the next message...`,
		);
		await delay(waitTime);
	}

	await producer.disconnect();
}

publishEvents().catch(console.error);
