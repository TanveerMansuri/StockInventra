import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../services/api";
import { useAuth } from "./AuthProvider";
import { LoginForm } from "./components/LoginForm";
import { LoginLayout } from "./components/login/LoginLayout";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <LoginLayout>
      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={error}
      />
    </LoginLayout>
  );
}
