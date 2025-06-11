import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RecipeHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/history/", {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        setHistory(response.data);
      } catch (error) {
        console.error("Error fetching history:", error);
        alert("Failed to load recipe history.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Your Recipe History</h2>

      {loading ? (
        <p>Loading...</p>
      ) : history.length === 0 ? (
        <p>No saved recipes yet.</p>
      ) : (
        <ul className="list-group">
          {history.map((item) => (
            <li key={item.id} className="list-group-item">
              <strong>Ingredients:</strong> {item.ingredients} <br />
              <strong>Recipe:</strong> {item.recipe} <br />
              <small className="text-muted">
                Created: {new Date(item.created_at).toLocaleString()}
              </small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecipeHistory;
