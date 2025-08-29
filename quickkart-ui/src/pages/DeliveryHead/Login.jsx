import LoginForm from "../../components/LoginForm";

export default function DeliveryHeadLogin() {
  return (
    <LoginForm
      userType="delivery-head"
      title="Delivery Head Login"
      subtitle="Manage your delivery operations"
      icon="🚚"
      primaryColor="accent"
      accentColor="secondary"
      signupLink="/delivery-head/register"
      signupText="Don't have an account?"
      redirectPath="/delivery-head/dashboard"
      endpoint="/auth/delivery-head/login"
    />
  );
}
