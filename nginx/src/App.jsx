import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { StyledEngineProvider } from "@mui/material";
import Header from "./components/chat/Header.jsx";
import List from "./components/list/List.jsx";
import Chat from "./components/chat/Chat.jsx";
import Auth from "./components/Auth/Auth.jsx";
import axios from "axios";
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader";
import "./index.css";
import ChatInput from "./components/chat/ChatInput.jsx";
import {API_URL} from './constants'


const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth-check`, {
        withCredentials: true,
      });
      if (response.status === 200 && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Ошибка проверки авторизации:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    const startTime = Date.now();
    checkAuth().finally(() => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(1500 - elapsedTime, 0);
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    });
  }, []);

  const router = createBrowserRouter([
    {
      path: "/chat-app/",
      element: loading ? (
        <ClimbingBoxLoader className="loader" color="#1976d2" width="100%" />
      ) : user ? (
        <Navigate to="/chat-app/chat" replace />
      ) : (
        <Auth />
      ),
    },
    {
      path: "/chat-app/auth",
      element: loading ? (
        <ClimbingBoxLoader className="loader" color="#1976d2" width="100%" />
      ) : (
        <Auth />
      ),
    },
    {
      path: "/chat-app/chat/:chatId",
      element: loading ? (
        <ClimbingBoxLoader className="loader" color="#1976d2" width="100%" />
      ) : user ? (
        <>
          <List />
          <Header />
          <ChatInput />
          <Chat />
        </>
      ) : (
        <Navigate to="/chat-app/" replace />
      ),
    },
    {
      path: "/chat-app/chat",
      element: loading ? (
        <ClimbingBoxLoader className="loader" color="#1976d2" width="100%" />
      ) : user ? (
        <>
          <List />
          <Header />
          <ChatInput />
          <Chat />
        </>
      ) : (
        <Navigate to="/chat-app/" replace />
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
          <RouterProvider router={router} basename="/chat-app" />
        )}
      </StyledEngineProvider>
    </div>
  );
};

export default App;
