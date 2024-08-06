"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "../ui/button";

const Checkout = ({
  plan,
  amount,
  credits,
  buyerId,
  variantId,
}: {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
  variantId: string;
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      toast({
        title: "Order placed!",
        description: "You will receive an email confirmation",
        duration: 5000,
        className: "success-toast",
      });
    }

    if (query.get("canceled")) {
      toast({
        title: "Order canceled!",
        description: "Continue to shop around and checkout when you're ready",
        duration: 5000,
        className: "error-toast",
      });
    }
  }, []);

  const onCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/purchaseProduct", {
        variantId,
        plan,
        amount,
        credits,
        buyerId,
      });
      
      if (response.data.checkoutUrl) {
        window.open(response.data.checkoutUrl, "_blank");
      } else {
        throw new Error("Checkout URL not received");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Checkout failed",
        description: "An error occurred while processing your request",
        duration: 5000,
        className: "error-toast",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={onCheckout}
      disabled={isLoading}
      className="w-full rounded-full bg-purple-gradient bg-cover"
    >
      {isLoading ? "Processing..." : "Buy Credit"}
    </Button>
  );
};

export default Checkout;