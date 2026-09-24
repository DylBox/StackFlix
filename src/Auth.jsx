
import { useState } from "react";
import { supabase } from "./supabaseClient";
import "./Auth.css";

export default function Auth({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        setSuccessMessage("Successfully signed in!");

        if (onClose) {
          onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          setSuccessMessage("Your account was created successfully!");

          if (onClose) {
            onClose();
          }
        } else {
          setSuccessMessage(
            "Account created! Check your email to confirm your account.",
          );
        }
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMessage("");
    setSuccessMessage("");
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <button className="auth-close" onClick={onClose}>
          ×
        </button>

        <div className="auth-header">
          <div className="auth-logo">
            STACK<span>FLIX</span>
          </div>

          <h1>{isLogin ? "Welcome Back" : "Create Your Account"}</h1>

          <p>
            {isLogin
              ? "Sign in to continue discovering movies."
              : "Join Stackflix and build your personal watchlist."}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email Address</label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />
          </div>

          {errorMessage && (
            <div className="auth-message auth-error">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="auth-message auth-success">
              {successMessage}
            </div>
          )}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isLogin
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>

        <div className="auth-switch">
          <span>
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}
          </span>

          <button onClick={toggleMode}>
            {isLogin ? "Create Account" : "Sign In"}
          </button>
        </div>
      </div>
    </section>
  );
}