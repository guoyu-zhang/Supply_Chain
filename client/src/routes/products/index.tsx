import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable2 } from "@/components/data-table";
import { DataTableColumnHeader } from "@/components/data-table-header";

const productColumns = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
  },
  {
    accessorKey: "supplier.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Supplier" />
    ),
  },
  {
    accessorKey: "parts.*.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Parts" />
    ),
  },
];

function Products() {
  const { isPending, error, data } = useQuery({
    queryKey: ["products"],
    queryFn: () =>
      fetch("http://127.0.0.1:4000/inventory").then((res) => res.json()),
  });

  const [products, setProducts] = useState([]);
  useEffect(() => {
    if (data) setProducts(data);
  }, [data]);
  // Data science features
  //const totalPayments = payments.length;
  //const totalAmount = payments.reduce(
  //    (sum, payment) => sum + payment.amount,
  //    0,
  //);
  //const averageAmount =
  //    totalPayments > 0 ? (totalAmount / totalPayments).toFixed(2) : 0;
  //
  //const statusCounts = payments.reduce(
  //    (acc, payment) => {
  //        acc[payment.status] = (acc[payment.status] || 0) + 1;
  //        return acc;
  //    },
  //    {} as Record<string, number>,
  //);

  //return (
  //<div classNamNode.removeChild: The node to be removed is not a child of this nodee="container mx-auto py-10">
  //    <div className="mb-8">
  //        <h2 className="text-2xl font-bold mb-4">Payment Insights</h2>
  //        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  //            <div className="bg-white rounded-lg shadow p-4">
  //                <h3 className="text-lg font-semibold">
  //                    Total Payments
  //                </h3>
  //                <p className="text-2xl">{totalPayments}</p>
  //            </div>
  //            <div className="bg-white rounded-lg shadow p-4">
  //                <h3 className="text-lg font-semibold">
  //                    Average Payment Amount
  //                </h3>
  //                <p className="text-2xl">${averageAmount}</p>
  //            </div>
  //            <div className="bg-white rounded-lg shadow p-4">
  //                <h3 className="text-lg font-semibold">Total Amount</h3>
  //                <p className="text-2xl">${totalAmount}</p>
  //            </div>
  //        </div>
  //    </div>
  //
  //    <div className="mb-4">
  //        <h3 className="text-xl font-bold mb-2">
  //            Payment Status Distribution
  //        </h3>
  //        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  //            {Object.entries(statusCounts).map(([status, count]) => (
  //                <div
  //                    key={status}
  //                    className="bg-white rounded-lg shadow p-4 text-center"
  //                >
  //                    <h4 className="text-lg font-semibold capitalize">
  //                        {status}
  //                    </h4>
  //                    <p className="text-2xl">{count}</p>
  //                </div>
  //            ))}
  //        </div>
  //    </div>
  if (isPending) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error?.message}</div>;
  }

  return (<div className="p-5">
    <DataTable2 columns={productColumns} data={products} search={{ column: "name", placeholder: "Please enter a product name..." }} />
  </div>);
}

export const Route = createFileRoute("/products/")({
  component: Products,
});
