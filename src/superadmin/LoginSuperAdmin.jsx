import React, { useState } from "react";
import axios from "axios";
import { FaEnvelope, FaLock, FaUserShield } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";



export default function LoginSuperAdmin() {
  const [form, setForm] = useState({ email: "", mot_de_passe: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    
    try {
      const res = await api.post(`/superadmin/auth/login`, form);
      localStorage.setItem("token", res.data.token);
      setMessage("Connexion réussie ! ✅");
      
      setTimeout(() => {
        navigate("/super-admin/dashboard");
      }, 800);
      
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur de connexion ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <FaUserShield style={styles.headerIcon} />
          <h2 style={styles.title}>Connexion Super Admin</h2>
          <p style={styles.subtitle}>Accédez à votre espace d'administration</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {[
            { 
              name: "email", 
              placeholder: "Adresse email", 
              icon: <FaEnvelope />, 
              type: "email" 
            },
            { 
              name: "mot_de_passe", 
              placeholder: "Mot de passe", 
              icon: <FaLock />, 
              type: "password" 
            },
          ].map(({ name, placeholder, icon, type }) => (
            <div key={name} style={styles.inputGroup}>
              <span style={styles.icon}>{icon}</span>
              <input
                name={name}
                type={type}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          ))}
          
          <button 
            type="submit" 
            disabled={loading} 
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {})
            }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p style={styles.switchText}>
          Première connexion ?{" "}
          <Link to="/super-admin/register" style={styles.link}>
            Créer un compte Super Admin
          </Link>
        </p>
        
        {message && (
          <p style={{
            ...styles.message,
            ...(message.includes("✅") ? styles.successMessage : styles.errorMessage)
          }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "20px",
  },
  card: {
    background: "#fff",
    padding: "40px 35px",
    borderRadius: "16px",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "420px",
    textAlign: "center",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  header: {
    marginBottom: "30px",
  },
  headerIcon: {
    fontSize: "48px",
    color: "#667eea",
    marginBottom: "15px",
  },
  title: {
    marginBottom: "8px",
    color: "#2d3748",
    fontSize: "28px",
    fontWeight: "600",
  },
  subtitle: {
    color: "#718096",
    fontSize: "14px",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    border: "1px solid #e2e8f0",
    padding: "14px 16px",
    borderRadius: "10px",
    transition: "all 0.3s ease",
    background: "#f8fafc",
  },
  icon: {
    color: "#667eea",
    fontSize: "16px",
    width: "20px",
  },
  input: {
    border: "none",
    outline: "none",
    flex: 1,
    fontSize: "15px",
    background: "transparent",
    color: "#2d3748",
  },
  button: {
    padding: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "15px",
    transition: "all 0.3s ease",
    marginTop: "10px",
  },
  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  switchText: {
    marginTop: "25px",
    fontSize: "14px",
    color: "#718096",
  },
  link: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "600",
    transition: "color 0.3s ease",
  },
  message: {
    marginTop: "20px",
    padding: "12px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
  },
  successMessage: {
    backgroundColor: "#f0fff4",
    color: "#38a169",
    border: "1px solid #9ae6b4",
  },
  errorMessage: {
    backgroundColor: "#fed7d7",
    color: "#e53e3e",
    border: "1px solid #fc8181",
  },
};