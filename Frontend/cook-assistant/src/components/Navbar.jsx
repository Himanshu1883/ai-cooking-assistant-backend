import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css"; // Custom animations & hover

const Navbar = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm animate__animated animate__fadeInDown">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold text-warning glow-text" to="/">
                    🍳 CookAIssist
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>


            </div>
        </nav>
    );
};

export default Navbar;
