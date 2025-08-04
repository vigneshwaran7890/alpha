import React from 'react';
import SignupForm from '@/components/auth/SignupForm';
import ThemeToggle from "@/components/ThemeToggle";

const Signup: React.FC = () => {
  return (
    <div >
      <ThemeToggle />
      <SignupForm />
    </div>
  );
};

export default Signup;