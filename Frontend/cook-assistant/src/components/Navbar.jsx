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

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        {user && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link hover-underline" to="/history">
                                        History
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>

                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                        {user ? (
                            <>
                                <li className="nav-item">
                                    <span className="nav-link text-light">👋 {user.username}</span>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className="btn btn-outline-warning btn-sm ms-2"
                                        onClick={() => {
                                            logoutUser();
                                            navigate("/login");
                                        }}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <Link className="btn btn-outline-light btn-sm me-2" to="/login">
                                        Login
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-warning btn-sm" to="/signup">
                                        Sign Up
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
