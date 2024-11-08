import HomeMap from "@/components/home-map";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, CircleX, Repeat, Timer } from "lucide-react";
import { useEffect, useState } from "react";
//import RealTimePurchases from "@/components/real-time-purchases";

export const Route = createFileRoute("/")({
  component: Index,
});

enum dataTables {
  pending,
  fufilled,
  cancelled,
  returns,
}

function Index() {
  const { isPending, error, data } = useQuery({
    queryKey: ["repoData"],
    queryFn: () =>
      fetch("http://127.0.0.1:4000/orderTotal").then((res) =>
        res.json(),
      ),
  });
  const [stats, setStats] = useState({ pending: 10, fufilled: 10, cancelled: 10, returned: 10 })

  useEffect(() => {
    if (data) setStats(data)
  }, [data])

  if (error || (data?.message))
    return (
      <div className="w-full h-full flex items-center justify-center">
        Loading...
      </div>
    );

  if (isPending)
    return (
      <div className="w-full h-full flex items-center justify-center">
        Loading...
      </div>
    );
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        <div className="col-span-full sm:col-span-2 md:col-span-1 cursor-pointer">
          <div className="flex items-center gap-4 p-4">
            <Timer className="p-2 rounded-full" size={"4rem"} />
            <div className="flex flex-col">
              <span className="text-4xl">{data.pending}</span>
              <span className="text-sm">Pending Orders</span>
            </div>
          </div>
        </div>

        <div className="col-span-full sm:col-span-2 md:col-span-1 cursor-pointer">
          <div className="flex items-center gap-4 p-4">
            <Check className="p-2 rounded-full" size={"4rem"} />
            <div className="flex flex-col">
              <span className="text-4xl">{data.fufilled}</span>
              <span className="text-sm">Fufilled Orders</span>
            </div>
          </div>
        </div>

        <div className="col-span-full sm:col-span-2 md:col-span-1 cursor-pointer">
          <div className="flex items-center gap-4 p-4">
            <CircleX className="p-2 rounded-full" size={"4rem"} />
            <div className="flex flex-col">
              <span className="text-4xl">{data.cancelled}</span>
              <span className="text-sm">Cancelled Orders</span>
            </div>
          </div>
        </div>

        <div className="col-span-full sm:col-span-2 md:col-span-1 cursor-pointer">
          <div className="flex items-center gap-4 p-4">
            <Repeat className="p-2 rounded-full" size={"4rem"} />
            <div className="flex flex-col">
              <span className="text-4xl">{data.returned}</span>
              <span className="text-sm">Returned Orders</span>
            </div>
          </div>
        </div>

        <Card className="md:col-span-full col-span-full">
          <CardHeader>
            <CardTitle>Order map</CardTitle>
            {/*<CardDescription>Card Description</CardDescription>*/}
          </CardHeader>
          <CardContent className="grow">
            <HomeMap />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
