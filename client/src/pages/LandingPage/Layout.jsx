import { Outlet } from "react-router-dom";

import { Box } from "@mui/material";
import Header from "../../components/LandingPage/Header";
import Footer from "../../components/LandingPage/Footer";

const LayoutLandingPage = () => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />

      <Box flexGrow={1} sx={{ position: "relative" }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  );
};

export default LayoutLandingPage;
