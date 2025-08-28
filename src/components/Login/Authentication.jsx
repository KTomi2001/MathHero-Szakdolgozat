import React, { useState, useEffect } from "react";
import "./Authentication.css";
import cat from "../../assets/MainPage/cat.svg";
import { auth, sendEmailVerification, db } from "../../firebase"; 
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"; 
import { doc, setDoc } from "firebase/firestore"; 
import { useNavigate } from "react-router-dom"; 

const Auth = ({ isOpen, onClose, initialAuthMode = "login" }) => {
  const [authMode, setAuthMode] = useState(initialAuthMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); 

  useEffect(() => {
    if (initialAuthMode) {
      setAuthMode(initialAuthMode);
    }
  }, [initialAuthMode]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      onClose(); 
      navigate("/dashboard"); 
    } catch (error) {
      setError("Bejelentkezés sikertelen: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      console.log("Regisztráció kezdése...");
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log("Felhasználó létrehozva Auth-ban:", user.uid);
  
      try {
        await updateProfile(user, {
          displayName: username,
        });
        console.log("Profil frissítve");
      } catch (profileError) {
        console.error("Profil frissítési hiba:", profileError);
      }

      try {
        const now = new Date();
        await setDoc(doc(db, "users", user.uid), {
          username: username,
          email: email,
          createdAt: now,
          stats: {
            lastLogin: now,
            loginToday: true,
            streak: 1,
            testCount: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            lastTestDate: null,
            accuracy: 0
          }
        });
        console.log("Felhasználói adatok hozzáadva egységes struktúrával");
      } catch (dbError) {
        console.error("Adatbázis hiba:", dbError);
      }

      try {
        await sendEmailVerification(user);
        console.log("Ellenőrző email elküldve");
      } catch (emailError) {
        console.error("Email küldési hiba:", emailError);
      }
  
      setAuthMode("login");
      setError("Sikeres regisztráció! Bejelentkezhetsz az adataiddal.");
    } catch (error) {
      console.error("Regisztrációs hiba:", error);
      
      if (error.code === "auth/email-already-in-use") {
        setError("Ez az email cím már használatban van. Próbálj bejelentkezni vagy használj másik címet.");
      } else if (error.code === "auth/invalid-email") {
        setError("Érvénytelen email cím formátum.");
      } else if (error.code === "auth/weak-password") {
        setError("A jelszó túl gyenge. Használj erősebb jelszót.");
      } else {
        setError("Regisztráció sikertelen: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-backdrop" onClick={onClose}></div>
      <div className="auth-modal-container">
        <div className="auth-modal-header">
          <button onClick={onClose} className="auth-modal-close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {authMode === "login" ? (
          <div className="auth-form-container">
            <div className="auth-header">
              <img src={cat} alt="MathHero" className="auth-logo" />
              <h2 className="auth-title">Bejelentkezés</h2>
            </div>

            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group mb-3">
                <div className="input-container">
                  <i className="bi bi-envelope input-icon"></i>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group mb-4">
                <div className="input-container">
                  <i className="bi bi-key input-icon"></i>
                  <input
                    type="password"
                    name="password"
                    placeholder="Jelszó"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Folyamatban..." : "Bejelentkezés"}
              </button>
            </form>

            <div className="auth-footer">
              <p className="auth-switch-text">Nincs még fiókod?</p>
              <button
                onClick={() => setAuthMode("register")}
                className="auth-switch-button"
              >
                Regisztráció
              </button>
            </div>
          </div>
        ) : (
          <div className="auth-form-container">
            <div className="auth-header">
              <img src={cat} alt="MathHero" className="auth-logo" />
              <h2 className="auth-title">Regisztráció</h2>
            </div>

            <form onSubmit={handleRegister} className="auth-form">
              <div className="form-group mb-3">
                <div className="input-container">
                  <i className="bi bi-person input-icon"></i>
                  <input
                    type="text"
                    name="username"
                    placeholder="Felhasználónév"
                    className="auth-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group mb-3">
                <div className="input-container">
                  <i className="bi bi-envelope input-icon"></i>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group mb-4">
                <div className="input-container">
                  <i className="bi bi-key input-icon"></i>
                  <input
                    type="password"
                    name="password"
                    placeholder="Jelszó"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? "Folyamatban..." : "Regisztráció"}
              </button>
            </form>

            <div className="auth-footer">
              <p className="auth-switch-text">Van már fiókod?</p>
              <button
                onClick={() => setAuthMode("login")}
                className="auth-switch-button"
              >
                Bejelentkezés
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;