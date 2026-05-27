import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/light_theme/B_StyleClaro.css";
import "./styles/light_theme/B_styleHome.css";
import "./styles/light_theme/B_StyleLogin.css";
import "./styles/light_theme/B_stylePerfil.css";
import "./styles/light_theme/B_styleServicio.css";
import "./styles/light_theme/B_StyleChat.css";

const GOOGLE_CLIENT_ID = "471373708153-c21ih3spcqdrdhr2vj67on4o6oo1j3ce.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
