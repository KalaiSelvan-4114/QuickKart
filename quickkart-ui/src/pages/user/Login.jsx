import LoginForm from "../../components/LoginForm";

export default function UserLogin() {
  return (
    <LoginForm
      userType="user"
      title="Welcome Back"
      subtitle="Sign in to your QuickKart account"
      icon="👤"
      primaryColor="primary"
      accentColor="accent"
      signupLink="/user/signup"
      signupText="Don't have an account?"
      redirectPath="/user/home"
      endpoint="/auth/user/login"
    />
  );
}
