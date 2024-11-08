import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, ChevronsUpDown, Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import axios from "axios";

function calculatePrice(data: any) {
  if (!data.parts || data.parts?.length === 0) return data.cost || 0;
  let parts_cost = 0;
  for (const i of data.parts) {
    parts_cost += calculatePrice(i);
  }
  return data.cost + parts_cost || 0;
}

function RouteComponent() {
  const navigate = useNavigate({ from: "/create" });
  const { isPending, error, data } = useQuery({
    queryKey: ["repoData"],
    queryFn: () =>
      fetch("http://127.0.0.1:4000/inventory").then((res) => res.json()),
  });
  const mutation = useMutation({
    mutationFn: (data) => {
      return axios.post("http://127.0.0.1:4000/create", data);
    },
  });
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [purchasable, setPurchaseable] = useState(false);
  const [count, setCount] = useState(1);
  const [price, setPrice] = useState(0);

  useEffect(() => {
    if (!data) return;
    const productS = data.filter((obj) => obj.sku === value);
    if (productS.length === 0) {
      setPurchaseable(false);
      setPrice(0);
      return;
    }
    const product = productS[0];
    if (mutation.isPending) {
      setTimeout(() =>
        navigate({ to: `/products/${product.sku}` }), 5000)
    }
    if (mutation.isSuccess) {
      navigate({ to: `/products/${product.sku}` });
    }
  }, [mutation, navigate]);
  useEffect(() => {
    if (!data) return;
    const productS = data.filter((obj) => obj.sku === value);
    if (productS.length === 0) {
      setPurchaseable(false);
      setPrice(0);
      return;
    }
    const product = productS[0];

    setPrice(calculatePrice(product) * count || 0);
    if (price > 0) {
      setPurchaseable(true);
    }
  }, [value, count, data, price, navigate, mutation]);

  if (error || data?.message)
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
    <div className="w-full h-full flex justify-center items-center">
      <div className="h-fit w-full sm:w-11/12 md:w-9/12 lg:w-1/2 xl:w-1/3 flex flex-col items-center justify-center gap-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {value
                ? data.find((product) => product.sku === value)
                  ?.name
                : "Select product..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search product..." />
              <CommandList>
                <CommandEmpty>No products found.</CommandEmpty>
                <CommandGroup>
                  {data.map((product) => (
                    <CommandItem
                      key={product.sku}
                      value={product.sku}
                      onSelect={(currentValue) => {
                        setValue(
                          currentValue === value
                            ? ""
                            : currentValue,
                        );
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === product.sku
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {product.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <div className="flex items-center w-full justify-between">
          <Label>
            <b>Count:</b> {count}
          </Label>
          <div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCount(count + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                if (count > 0) setCount(count - 1);
              }}
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {price > 0 && (
          <>
            <div>Price: £{price.toFixed(2)}</div>
            <Button
              className="w-full"
              disabled={!purchasable || mutation.isPending}
              onClick={() => {
                if (!data) return;
                const productS = data.filter(
                  (obj) => obj.sku === value,
                );
                if (productS.length === 0) {
                  setPurchaseable(false);
                  setPrice(0);
                  return;
                }
                const product = productS[0];
                mutation.mutate({
                  id: product._id,
                  price,
                  amount: count,
                });
              }}
            >
              Purchase
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
export const Route = createFileRoute("/create")({
  component: RouteComponent,
});
