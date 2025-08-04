import React from 'react';
import LoginForm from "@/components/auth/LoginForm";
import ThemeToggle from "@/components/ThemeToggle";

const Login: React.FC = () => {
  return (
    <div>
      <ThemeToggle />
      <LoginForm />
    </div>
  );
};

export default Login;