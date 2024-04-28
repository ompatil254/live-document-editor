import React, { useState, useEffect } from "react";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    createNewRoom();
  }, []); // Run only once on component mount

  const createNewRoom = () => {
    const id = uuidV4();
    console.log(id);

    navigate(`/editor/${id}`, {
      state: {
        username: "Guest", // Default username for auto-created room
      },
    });

    toast.success("Created a new room");
  };

  return null; // Render nothing, as the page will redirect immediately
};

export default Home;
