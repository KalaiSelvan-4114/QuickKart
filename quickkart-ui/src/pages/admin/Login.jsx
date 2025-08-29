import LoginForm from "../../components/LoginForm";

export default function AdminLogin() {
  return (
    <LoginForm
      userType="admin"
      title="Admin Login"
      subtitle="Access QuickKart admin panel"
      icon="⚙️"
      primaryColor="secondary"
      accentColor="primary"
      redirectPath="/admin/dashboard"
      endpoint="/auth/admin/login"
    />
  );
}
