import React from "react";
import { useOutletContext } from "react-router-dom";
import NewRequests from "../pages/NewRequests";

export default function NewRequestsWrapper() {
  const { shopId } = useOutletContext();
  if (!shopId) return <p>Loading...</p>;
  return <NewRequests shopId={shopId} />;
}
