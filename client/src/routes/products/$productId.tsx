import React, { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import SupplyMap from "@/components/supply-map";
import { useQueries } from "@tanstack/react-query";
import { DataTable2 } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table-header";

export const Route = createFileRoute("/products/$productId")({
    component: ProductComponent,
});

function ProductComponent() {
    const { productId } = Route.useParams();

    const results = useQueries({
        queries: [
            {
                queryKey: ["product", productId],
                queryFn: () =>
                    fetch(`http://127.0.0.1:4000/inventory/${productId}`).then(
                        (res) => res.json(),
                    ),
            },
            {
                queryKey: ["order", productId],
                queryFn: () =>
                    fetch(`http://127.0.0.1:4000/orders/${productId}`).then(
                        (res) => res.json(),
                    ),
            },
        ],
    });

    const [inventoryQuery, orderQuery] = results;
    const [orders, setOrders] = useState([]);
    const [locations, setLocations] = useState([]);
    const [isLocationsLoading, setIsLocationsLoading] = useState(true);

    useEffect(() => {
        const fetchAndSetData = async () => {
            if (orderQuery.data) {
                setOrders(orderQuery.data);

                // Extract location data using the stack-based algorithm
                const extractedLocations = [];
                const stack = [];

                // Initial hardcoded location
                extractedLocations.push([-1.5733, 54.7761]); 

                orderQuery.data.forEach((order) => {
                    // If parts exist, initialize stack with them
                    if (order.product_id && order.product_id.parts) {
                        stack.push(...order.product_id.parts);
                    }

                    // Process parts in stack
                    while (stack.length > 0) {
                        const part = stack.pop();

                        // Check if part's supplier has a warehouse with location
                        if (part.supplier && part.supplier.warehouses) {
                            const { location } = part.supplier.warehouses;
                            if (location) {
                                extractedLocations.push([
                                    location.lng,
                                    location.lat,
                                ]); 
                            }
                        }

                        // Add sub-parts to stack for further processing
                        if (part.parts && part.parts.length > 0) {
                            stack.push(...part.parts);
                        }
                    }

                    // Also, check the main warehouse location for the order
                    if (order.warehouse_id && order.warehouse_id.location) {
                        const { lng, lat } = order.warehouse_id.location;
                        extractedLocations.push([lng, lat]);
                    }
                });

                setLocations(extractedLocations);
                setIsLocationsLoading(false); // Set loading to false after data is set
                console.log(extractedLocations);
            }
        };

        fetchAndSetData(); // Run the async function
    }, [orderQuery.data]);

    const ordersColumns = [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Product" />
            ),
        },
        {
            accessorKey: "amount",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Stock"
                />            
            ),},
        {
            accessorKey: "cost",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Cost (GBP)"
                />            
            ),
}]; 

if (
    inventoryQuery.isLoading ||
    orderQuery.isLoading ||
    isLocationsLoading
) {
 
        return <div>Loading...</div>;
    }

    if (inventoryQuery.isError || orderQuery.isError) {
return (
            <div>
                Error:{" "}
                {inventoryQuery.error?.message || orderQuery.error?.message}
            </div>
        );
    }

    return (
        <>
            {/* Map and AI Insights Section */}
            <div className="flex h-full w-full">
                <SupplyMap locations={locations} />
                <div className="insights-container">
                    <h2>AI Insights</h2>
                    <p>
                        Based on current supply chain data, we recommend the
                        following actions: 
                    </p>
                    <ul>
                        <li>Increase stock for high-demand products.</li>
                    <li>Optimize routes to reduce transportation time.</li>
                    <li>
                Consider alternate suppliers for products with low
    stock.                                                   
                        </li>
                    </ul>
                </div>
            </div>
            <div class="w-full flex items-center justify-center p-4">Required Parts</div>
            <DataTable2 columns={ ordersColumns} data={inventoryQuery.data.parts} />
        </>
    );
}

export default ProductComponent;
