import { useState } from "react";
import "./Auth.css";
import { supabase } from "./supabaseClient";

function Auth({ onClose }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function switchMode() {
    setIsRegistering((currentMode) => !currentMode);
    setUsername("");
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    if (isRegistering && !cleanUsername) {
      setErrorMessage("Please enter a username.");
      return;
    }

    if (!cleanEmail || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              username: cleanUsername,
              full_name: cleanUsername,
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          setSuccessMessage("Your account was created successfully.");
          onClose();
        } else {
          setSuccessMessage(
            "Account created. Check your email to confirm your account before logging in.",
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          throw error;
        }

        onClose();
      }
    } catch (requestError) {
      setErrorMessage(requestError.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button className="auth-close" onClick={onClose} type="button">
          ×
        </button>

        <p className="auth-eyebrow">STACKFLIX</p>

        <h1>{isRegistering ? "Create your account" : "Welcome back"}</h1>

        <p className="auth-description">
          {isRegistering
            ? "Choose a username so Stackflix can welcome you personally."
            : "Log in to manage your personal movie watchlist."}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <label>
              Username
              <input
                type="text"
                placeholder="Enter a username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                maxLength={30}
                autoComplete="nickname"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={isRegistering ? "new-password" : "current-password"}
              required
            />
          </label>

          {errorMessage && <p className="auth-message auth-error">{errorMessage}</p>}
          {successMessage && (
            <p className="auth-message auth-success">{successMessage}</p>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isRegistering
                ? "Create Account"
                : "Log In"}
          </button>
        </form>

        <p className="auth-switch">
          {isRegistering ? "Already have an account?" : "New to Stackflix?"}{" "}
          <button type="button" onClick={switchMode}>
            {isRegistering ? "Log in" : "Create an account"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;