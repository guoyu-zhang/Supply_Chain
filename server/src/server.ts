// server.js
import express from "express";
import mongoose from "mongoose";
import { Inventory, Order } from "./models";
import helmet from "helmet";
import cors from "cors";
import moment from "moment";
import { ObjectId } from "mongoose";

// Initialize Express
const app = express();
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin: "*", // Allow all origins
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow specific methods
        allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers
        credentials: false, // Do not expose credentials
    }),
);
app.use(express.json()); // For parsing application/json

// Connect to MongoDB
mongoose
    .connect(
        "mongodb+srv://alexandreapinheirodias:deybKJEX9R9wGwo9@beachboys.qjpl1.mongodb.net/database?retryWrites=true&w=majority&appName=BeachBoys",
    )
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

app.get("/orders", async (req, res) => {
    console.log("get /orders");
    try {
        //{pending: , fufilled: }
        const result = await Order.find()
            .populate("warehouse_id product_id")
            .exec();
        console.log(result);
        if (!result) {
            return res.status(404).json({ message: "Item not found" });
        }
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});
app.get("/orderTotal", async (req, res) => {
    console.log("get /orders");
    try {
        const pending = await Order.countDocuments({
            returned: false,
            delivery: {
                cancelled: false,
            },
        }).exec();
        const fufilled = await Order.countDocuments({
            returned: false,
            delivery: {
                cancelled: false,
            },
        }).exec();
        const cancelled = await Order.countDocuments({
            delivery: { cancelled: true },
        }).exec();
        const returned = await Order.countDocuments({
            returned: true,
        }).exec();
        console.log(pending);
        console.log(fufilled);
        console.log(cancelled);
        console.log(returned);
        if ([pending, fufilled, cancelled, returned].includes(null)) {
            return res.status(404).json({ message: "Item not found" });
        }
        return res.json({ pending, fufilled, cancelled, returned });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/orders/:sku", async (req, res) => {
    try {
        const product = await Inventory.findOne({ sku: req.params.sku });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const result = await Order.find({
            product_id: product._id,
        })
            .populate({
                path: "product_id",
                populate: {
                    path: "parts",
                    populate: {
                        path: "supplier",
                        populate: { path: "warehouses" },
                    },
                },
            })
            .populate("warehouse_id")
            .exec();
        if (!result) {
            return res.status(404).json({ message: "Item not found" });
        }
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/inventory", async (req, res) => {
    console.log("get /inventory");
    try {
        const result = await Inventory.find()
            .populate({
                path: "parts",
                populate: {
                    path: "supplier",
                    populate: { path: "warehouses" },
                },
            })
            .populate({
                path: "supplier",
                populate: {
                    path: "warehouses",
                    populate: { path: "products" },
                },
            })
            .exec();
        console.log(result);
        if (!result) {
            return res.status(404).json({ message: "Item not found" });
        }
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/inventory/:sku", async (req, res) => {
    try {
        const result = await Inventory.findOne({
            sku: req.params.sku,
        })
            .populate({
                path: "parts",
                populate: {
                    path: "supplier",
                    populate: {
                        path: "warehouses",
                        populate: { path: "products" },
                    },
                },
            })
            .populate({
                path: "supplier",
                populate: {
                    path: "warehouses",
                    populate: { path: "products" },
                },
            })
            .exec();
        if (!result) {
            return res.status(404).json({ message: "Item not found" });
        }
        return res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/inventory/:sku", async (req, res) => {
    //Inventory.();
    return res.json({});
});

// Define a route to create a new inventory item
app.post("/inventory", async (req, res) => {
    console.log("req recieved at /inventory");
    try {
        const newItem = new Inventory(req.body);
        await newItem.save();
        return res.status(201).json(newItem);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, "127.0.0.1", () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
