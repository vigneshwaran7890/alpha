import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { SocketProvider } from "./contexts/SocketContext";
import React, { useEffect, useState } from "react";
import { useSocket } from "@/contexts/SocketContext";
import axios from "axios";

export const EnrichPersonButton: React.FC<{ personId: string }> = ({ personId }) => {
  const socket = useSocket();
  const [progress, setProgress] = useState<string>("");

  useEffect(() => {
    if (!socket) return;

    const handleProgress = (data: any) => setProgress(data.message);
    const handleError = (data: any) => setProgress(`Error: ${data.error}`);
    const handleComplete = (data: any) => {
      setProgress("Enrichment complete.");
      // Optionally, you can do something with the complete data here
    };

    socket.on("enrich-progress", handleProgress);
    socket.on("enrich-error", handleError);
    socket.on("enrich-complete", handleComplete);

    return () => {
      socket.off("enrich-progress", handleProgress);
      socket.off("enrich-error", handleError);
      socket.off("enrich-complete", handleComplete);
    };
  }, [socket]);

  const handleEnrich = async () => {
    if (!socket) return;
    setProgress("Starting enrichment...");

    await axios.post(
      `/api/enrich/${personId}`,
      {},
      {
        headers: {
          "x-socket-id": socket.id,
        },
      }
    );
  };

  return (
    <div>
      <button onClick={handleEnrich}>Enrich Person</button>
      <div>{progress}</div>
    </div>
  );
};

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SocketProvider>
      <App />
    </SocketProvider>
  </React.StrictMode>
);
