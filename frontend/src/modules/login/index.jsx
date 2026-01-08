import { LoginHero } from "./components/LoginHero";
import { LoginForm } from "./components/LoginForm";

/**
 * LoginPage - Main composition component for the login module
 * Combines hero and form components
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left side - Hero with image and features */}
      <LoginHero />

      {/* Right side - Login Form */}
      <LoginForm />
    </div>
  );
}

// Re-export components for external use
export { LoginHero } from "./components/LoginHero";
export { LoginForm } from "./components/LoginForm";
export { useLogin } from "./hooks/useLogin";
export { authService } from "./services/authService";
export { loginSchema, loginFormDefaults } from "./schemas/loginSchema";
