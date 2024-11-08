import mongoose, { Schema } from "mongoose";

const inventorySchema = new Schema({
    name: { type: String, required: true },
    sku: { type: String, required: true },
    amount: { type: Number, required: true },
    parts: [{ type: Schema.Types.ObjectId, ref: "Inventory" }],
    supplier: { type: Schema.Types.ObjectId, ref: "Supplier", required: true },
});

const supplierSchema = new Schema({
    name: { type: String, required: true },
    warehouses: {
        type: Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true,
    },
});

const warehouseLocationSchema = new Schema({
    lng: { type: Number, required: true },
    lat: { type: Number, required: true },
});
const warehouseSchema = new Schema({
    name: { type: String, required: true },
    location: { type: warehouseLocationSchema, required: true },
    suppliers: [{ type: Schema.Types.ObjectId, ref: "Supplier" }],
    products: [{ type: Schema.Types.ObjectId, ref: "Inventory" }],
});

const deliverySchema = new Schema({
    completed_at: { type: Date, required: true },
    mode: { type: String, required: true },
});
const orderSchema = new Schema({
    amount: { type: Number, required: true },
    warehouse_id: {
        type: Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true,
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: "Inventory",
        required: true,
    },
    delivery: { type: deliverySchema, required: true },
});

export const Inventory = mongoose.model(
    "Inventory",
    inventorySchema,
    "inventory",
);
export const Supplier = mongoose.model("Supplier", supplierSchema, "suppliers");
export const Warehouse = mongoose.model(
    "Warehouse",
    warehouseSchema,
    "warehouses",
);
export const Order = mongoose.model("Order", orderSchema, "orders");
//
//let document = await KittenModel.create({ name: "Kitty" });
