import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import cat from "../../assets/MainPage/cat.svg";
import "./DashboardSettings.css";
import { auth, db } from "../../firebase";
import { 
  updateProfile, 
  updateEmail, 
  updatePassword, 
  signOut, 
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider
} from "firebase/auth";
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";

const DashboardSettings = ({ username, onLogout }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [displayName, setDisplayName] = useState(username || "");
  const [originalDisplayName, setOriginalDisplayName] = useState(""); 
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState(""); 
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          setUser(currentUser);
          setEmailVerified(currentUser.emailVerified);
          setEmail(currentUser.email || "");
          setOriginalEmail(currentUser.email || "");
          setDisplayName(currentUser.displayName || "");
          setOriginalDisplayName(currentUser.displayName || "");
        }
      } catch (error) {
        console.error("Hiba a felhasználó adatainak lekérésekor:", error);
        setMessage({
          text: "Nem sikerült betölteni a felhasználói adatokat.",
          type: "error"
        });
      }
    };

    fetchUserData();
    document.body.classList.add("dashboard-page");
    return () => {
      document.body.classList.remove("dashboard-page");
    };
  }, []);

  const checkUsernameExists = async (username) => {
    if (username === originalDisplayName) {
      return false;
    }
    
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Hiba a felhasználónév ellenőrzésekor:", error);
      return true; 
    }
  };

  const checkEmailExists = async (email) => {
    if (email === originalEmail) {
      return false;
    }
    
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Hiba az email cím ellenőrzésekor:", error);
      return true; 
    }
  };

  const reauthenticate = async (password) => {
    try {
      const currentUser = auth.currentUser;
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);
      return true;
    } catch (error) {
      console.error("Újrahitelesítési hiba:", error);
      setMessage({
        text: "Helytelen jelenlegi jelszó. Kérjük, próbáld újra.",
        type: "error"
      });
      return false;
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const currentUser = auth.currentUser; 

      if (currentUser.displayName !== displayName) {
        const usernameExists = await checkUsernameExists(displayName);
        
        if (usernameExists) {
          setMessage({
            text: "Ez a felhasználónév már foglalt. Kérjük, válassz másikat.",
            type: "error"
          });
          setLoading(false);
          return;
        }
        
        await updateProfile(currentUser, {
          displayName: displayName
        });

        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, {
          username: displayName
        });
        
        setOriginalDisplayName(displayName);
      }
      
      setMessage({
        text: "Profil sikeresen frissítve!",
        type: "success"
      });
    } catch (error) {
      console.error("Profil frissítési hiba:", error);
      setMessage({
        text: "Hiba történt a profil frissítésekor: " + error.message,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      if (!currentPassword) {
        setMessage({
          text: "Add meg a jelenlegi jelszavad az email cím módosításához.",
          type: "error"
        });
        setLoading(false);
        return;
      }

      if (email !== originalEmail) {
        const emailExists = await checkEmailExists(email);
        
        if (emailExists) {
          setMessage({
            text: "Ez az email cím már használatban van. Kérjük, válassz másikat.",
            type: "error"
          });
          setLoading(false);
          return;
        }
      }

      const isReauthenticated = await reauthenticate(currentPassword);
      if (!isReauthenticated) {
        setLoading(false);
        return;
      }

      const currentUser = auth.currentUser;
      await updateEmail(currentUser, email);
      
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, { email: email });
      
      setOriginalEmail(email);
      
      await sendEmailVerification(currentUser);

      setMessage({
        text: "Email cím sikeresen frissítve! Kérjük, erősítsd meg az új email címed.",
        type: "success"
      });
      setCurrentPassword("");
    } catch (error) {
      console.error("Email frissítési hiba:", error);
      setMessage({
        text: "Hiba történt az email cím frissítésekor: " + error.message,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    if (newPassword !== confirmPassword) {
      setMessage({
        text: "Az új jelszavak nem egyeznek!",
        type: "error"
      });
      setLoading(false);
      return;
    }

    try {
      const isReauthenticated = await reauthenticate(currentPassword);
      if (!isReauthenticated) {
        setLoading(false);
        return;
      }

      const currentUser = auth.currentUser;
      await updatePassword(currentUser, newPassword);

      setMessage({
        text: "Jelszó sikeresen megváltoztatva!",
        type: "success"
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Jelszó módosítási hiba:", error);
      setMessage({
        text: "Hiba történt a jelszó módosításakor: " + error.message,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      await sendEmailVerification(currentUser);
      
      setMessage({
        text: "Megerősítő email újraküldve! Kérjük, ellenőrizd a postafiókod.",
        type: "success"
      });
    } catch (error) {
      console.error("Email küldési hiba:", error);
      setMessage({
        text: "Hiba történt a megerősítő email küldésekor: " + error.message,
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Biztosan ki szeretne jelentkezni?");
    if (confirmLogout) {
      if (onLogout) {
        onLogout();
      } else {
        signOut(auth).then(() => {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          navigate("/");
        }).catch((error) => {
          console.error("Kijelentkezési hiba:", error);
        });
      }
    }
  };

  return (
    <div className="dashboard-container">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        {sidebarCollapsed && (
          <div
            className="hamburger-icon"
            onClick={toggleSidebar}
            role="button"
            tabIndex={0}
            aria-label="Expand sidebar"
          >
            ☰
          </div>
        )}

        {!sidebarCollapsed && (
          <button
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
          >
            ☰
          </button>
        )}

        <div className="logo">
          <img src={cat} alt="MathHero" />
          <h1>MATHHERO</h1>
        </div>

        <hr className="menu-divider" />

        <div className="menu-items">
          <div className="menu-item" onClick={() => navigate("/dashboard")}>
            <span className="icon">👤</span>
            <span>Felhasználó</span>
          </div>
          <div className="menu-item" onClick={() => navigate("/practice")}>
            <span className="icon">⭐</span>
            <span>Gyakorlás</span>
          </div>
        </div>

        <div className="menu-items bottom-menu">
          <hr className="menu-divider" />
          <div className="menu-item active" onClick={() => navigate("/settings")}>
            <span className="icon">⚙️</span>
            <span>Beállítások</span>
          </div>
          <div className="menu-item" onClick={handleLogout}>
            <span className="icon">🚪</span>
            <span>Kijelentkezés</span>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="settings-header">
          <h2>Felhasználói beállítások</h2>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="settings-sections">
          <div className="settings-section">
            <h3>Felhasználónév megváltoztatása</h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="displayName">Felhasználónév</label>
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? "Folyamatban..." : "Profil mentése"}
              </button>
            </form>
          </div>

          <div className="settings-section">
            <h3>Email megváltoztatása</h3>
            {user && !emailVerified && (
              <div className="verification-warning">
                <p>Az email címed még nincs megerősítve.</p>
                <button 
                  onClick={resendVerificationEmail} 
                  disabled={loading}
                  className="secondary-button"
                >
                  Megerősítő email újraküldése
                </button>
              </div>
            )}
            <form onSubmit={handleUpdateEmail}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="currentPassword">Jelenlegi jelszó</label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? "Folyamatban..." : "Email frissítése"}
              </button>
            </form>
          </div>

          <div className="settings-section">
            <h3>Jelszó megváltoztatása</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label htmlFor="currentPwd">Jelenlegi jelszó</label>
                <input
                  type="password"
                  id="currentPwd"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">Új jelszó</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Új jelszó megerősítése</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? "Folyamatban..." : "Jelszó módosítása"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSettings;