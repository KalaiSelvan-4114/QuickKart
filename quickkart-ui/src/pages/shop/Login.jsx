import LoginForm from "../../components/LoginForm";

export default function ShopLogin() {
  return (
    <LoginForm
      userType="shop"
      title="Shop Login"
      subtitle="Sign in to your QuickKart shop account"
      icon="🏪"
      primaryColor="accent"
      accentColor="primary"
      signupLink="/shop/signup"
      signupText="Don't have a shop account?"
      redirectPath="/shop/dashboard"
      endpoint="/auth/shop/login"
    />
  );
}
