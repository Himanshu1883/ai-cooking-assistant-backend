import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import RecipeForm from "./components/RecipeForm";
import RecipeHistory from "./components/RecipeHistory";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<RecipeForm />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>}></Route>
          <Route
            path="/history"
            element={
              
                <RecipeHistory />
             
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
