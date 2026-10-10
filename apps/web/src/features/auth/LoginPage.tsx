import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/api";
import { useAuth } from "./AuthProvider";
import { LoginForm } from "./components/LoginForm";
import { ForgotPasswordForm } from "./components/ForgotPasswordForm";
import { LoginLayout } from "./components/login/LoginLayout";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<"login" | "forgot-password">("login");

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleLogin = async (credentials: {
    email: string;
    password: string;
  }) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await authService.login(credentials);
      if (response.success) {
        login(response.data);
        navigate(from, { replace: true });
      } else {
        setError(response.message || "Invalid credentials");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOTP = async (email: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword({ email });
      if (res.success) return true;
      setError(res.message || "Failed to send reset code");
      return false;
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to send reset code");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (email: string, otp: string, newPassword: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await authService.resetPassword({ email, otp, newPassword });
      if (res.success) {
        setView("login");
        setError("Password reset successfully. Please login.");
      } else {
        setError(res.message || "Failed to reset password");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginLayout>
      {view === "login" ? (
        <LoginForm
          onSubmit={handleLogin}
          onForgotPassword={() => {
            setError(null);
            setView("forgot-password");
          }}
          isLoading={isLoading}
          error={error}
        />
      ) : (
        <ForgotPasswordForm
          onBack={() => {
            setError(null);
            setView("login");
          }}
          onRequestOTP={handleRequestOTP}
          onResetPassword={handleResetPassword}
          isLoading={isLoading}
          error={error}
        />
      )}
    </LoginLayout>
  );
}
