import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect ke halaman login
    navigate("/login");
  }, [navigate]);

  return null;
};

export default Index;
