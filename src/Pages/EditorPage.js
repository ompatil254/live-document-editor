import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import { initSocket } from "../socket";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

const EditorPage = ({ username }) => {
  // Accept username as a prop
  const socketRef = useRef(null);
  const codeRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  const { roomId } = useParams();

  const [clients, setClients] = useState([]);

  useEffect(() => {
    // Initialize the component
    const init = async () => {
      try {
        // Initialize socket connection
        socketRef.current = await initSocket();

        // Handle socket connection errors
        socketRef.current.on("connect_error", (err) => handleErrors(err));
        socketRef.current.on("connect_failed", (err) => handleErrors(err));

        function handleErrors(e) {
          console.log("socket error", e);
          toast.error("Socket connection failed, try again later");
          reactNavigator("/");
        }

        // Join the room
        socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          username: username, // Use the passed username
        });

        // Listen for 'joined' events
        socketRef.current.on(
          ACTIONS.JOINED,
          ({ clients, username, socketId }) => {
            if (username !== username) {
              // Fixed comparison
              toast.success(`${username} joined the room.`);
              // console.log(username);
            }
            setClients(clients);

            // Sync code with newly joined user
            socketRef.current.emit(ACTIONS.SYNC_CODE, {
              code: codeRef.current,
              socketId,
            });
          }
        );

        // Listen for 'disconnected' events
        socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
          toast.success(`${username} left the room.`);
          setClients((prev) =>
            prev.filter((client) => client.socketId !== socketId)
          );
        });
      } catch (error) {
        console.error("Error initializing socket:", error);
        toast.error("Failed to initialize socket connection");
      }
    };
    init();

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOIN);
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
  }, []);

  async function copyRoomID() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been copied to your clipboard");
    } catch (error) {
      toast.error("Failed to copy room ID");
      console.error("Error copying room ID:", error);
    }
  }

  async function LeaveRoom() {
    reactNavigator("/");
  }

  // Redirect if location state is not set
  if (!location.state) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="mainWrap">
      <div className="editorWrap">
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => (codeRef.current = code)}
        />
      </div>
    </div>
  );
};

export default EditorPage;
