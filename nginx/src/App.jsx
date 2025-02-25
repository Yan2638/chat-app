import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { StyledEngineProvider } from "@mui/material";
import Chat from "./components/chat/Chat.jsx";
import List from "./components/list/List.jsx";
import Message from "./components/chat/Message.jsx";
import Auth from "./components/Auth/Auth.jsx";
import axios from "axios";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import "./index.css";

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await axios.get("http://localhost:3000/auth-check", {
        withCredentials: true,
      });

      if (response.status === 200) {
        setUser({});
      } else {
        setUser(null);
      }
    } catch {
      setUser(null); 
    }
  };

  useEffect(() => {
    const startTime = Date.now();

    checkAuth().finally(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(3000 - elapsedTime, 0);

      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    });
  }, []);

  const router = createBrowserRouter([
    {
      path: "/",
      element: loading ? (
        <ClimbingBoxLoader className="loader" color="#1976d2" width="100%" />
      ) : user ? (
        <Navigate to="/chat" replace />
      ) : (
        <Auth />
      ),
    },
    {
      path: "/auth",
      element: loading ? (
        <ClimbingBoxLoader className="loader" color="#1976d2" width="100%" />
      ) : (
        <Auth />
      ),
    },
    {
      path: "/chat",
      element: loading ? (
        <ClimbingBoxLoader className="loader" color="#1976d2" width="100%" />
      ) : user ? (
        <>
          <List />
          <Chat />
          <Message />
        </>
      ) : (
        <Navigate to="/" replace />
      ),
    },
  ]);

  return (
    <div className="container">
      <StyledEngineProvider injectFirst>
        {loading ? (
          <div className="loading-screen">
            <ClimbingBoxLoader className="loader" color="#1976d2" width="100%" />
          </div>
        ) : (
          <RouterProvider router={router} />
        )}
      </StyledEngineProvider>
    </div>
  );
};

export default App;
