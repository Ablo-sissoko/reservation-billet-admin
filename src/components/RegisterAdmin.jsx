import React, { useState } from "react";
import API from "../services/api";
import { FaUser, FaEnvelope, FaLock, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router-dom";

const RegisterAdmin = () => {
  const [form, setForm] = useState({
    nom: "",
    adresse: "",
    telephone: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await API.post("/compagnies/register", form);
      setMessage("Compte créé avec succès ✅");
      localStorage.setItem("token_compagnie", res.data.token);
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur d’inscription ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Créer un compte Compagnie</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            { name: "nom", placeholder: "Nom", icon: <FaUser /> },
            { name: "adresse", placeholder: "Adresse", icon: <FaMapMarkerAlt /> },
            { name: "telephone", placeholder: "Téléphone", icon: <FaPhone /> },
            { name: "email", placeholder: "Email", icon: <FaEnvelope />, type: "email" },
            { name: "password", placeholder: "Mot de passe", icon: <FaLock />, type: "password" },
          ].map(({ name, placeholder, icon, type }) => (
            <div key={name} style={styles.inputGroup}>
              <span style={styles.icon}>{icon}</span>
              <input
                name={name}
                type={type || "text"}
                placeholder={placeholder}
                onChange={handleChange}
                required={name !== "email" ? true : false}
                style={styles.input}
              />
            </div>
          ))}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Création..." : "Créer le compte"}
          </button>
        </form>
        <p style={styles.switchText}>
          Déjà un compte ? <Link to="/login" style={styles.link}>Se connecter</Link>
        </p>
        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1d8cf8, #3358f4)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
  },
  title: { marginBottom: "25px", color: "#333" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    border: "1px solid #ccc",
    padding: "12px",
    borderRadius: "8px",
    transition: "0.3s",
  },
  icon: { color: "#1d8cf8", fontSize: "18px" },
  input: {
    border: "none",
    outline: "none",
    flex: 1,
    fontSize: "14px",
  },
  button: {
    padding: "12px",
    background: "#1d8cf8",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.3s",
  },
  switchText: { marginTop: "15px", fontSize: "14px" },
  link: { color: "#1d8cf8", textDecoration: "none", fontWeight: "bold" },
  message: { marginTop: "15px", color: "#e74c3c" },
};

export default RegisterAdmin;
