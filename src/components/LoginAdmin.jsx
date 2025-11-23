import React, { useState } from "react";
import API from "../services/api";
import { FaPhone, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { use } from "react";

const LoginAdmin = () => {
    const [form, setForm] = useState({ telephone: "", password: "" });
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);
        try {
            const res = await API.post("/compagnies/login", form);
            localStorage.setItem("token_compagnie", res.data.token);
            localStorage.setItem("compagnie_id", res.data.compagnie.id);


            setMessage("Connexion réussie ✅");
            setTimeout(() => {
                navigate("/dashboard"); // ✅ redirection React Router
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
                <h2 style={styles.title}>Connexion Compagnie</h2>
                <form onSubmit={handleSubmit} style={styles.form}>
                    {[
                        { name: "telephone", placeholder: "Téléphone", icon: <FaPhone /> },
                        { name: "password", placeholder: "Mot de passe", icon: <FaLock />, type: "password" },
                    ].map(({ name, placeholder, icon, type }) => (
                        <div key={name} style={styles.inputGroup}>
                            <span style={styles.icon}>{icon}</span>
                            <input
                                name={name}
                                type={type || "text"}
                                placeholder={placeholder}
                                value={form[name]}
                                onChange={handleChange}
                                required
                                style={styles.input}
                            />
                        </div>
                    ))}
                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>
                </form>
                <p style={styles.switchText}>
                    Pas de compte ? <Link to="/" style={styles.link}>Créer un compte</Link>
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
        maxWidth: "400px",
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
    input: { border: "none", outline: "none", flex: 1, fontSize: "14px" },
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

export default LoginAdmin;
