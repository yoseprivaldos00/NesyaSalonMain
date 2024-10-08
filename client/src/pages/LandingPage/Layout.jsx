/* eslint-disable no-unused-vars */
import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Header from "../../components/LandingPage/Header";
import Footer from "../../components/LandingPage/Footer";

const LayoutLandingPage = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.alt",
      }}
    >
      <Header />
      <Box
        flexGrow={1}
        sx={{ position: "relative", backgroundColor: "white", pt: "81px" }}
      >
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default LayoutLandingPage;
