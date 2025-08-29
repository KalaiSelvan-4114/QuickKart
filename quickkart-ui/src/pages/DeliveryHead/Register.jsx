import SignupForm from "../../components/SignupForm";

export default function DeliveryHeadRegister() {
  const fields = [
    {
      name: "username",
      label: "Username",
      type: "text",
      placeholder: "Enter username",
      required: true
    },
    {
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter your full name",
      required: true
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter your email",
      required: true,
      autoComplete: "email"
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "tel",
      placeholder: "Enter your phone number",
      required: true
    },
    {
      name: "aadhar",
      label: "Aadhar Number",
      type: "text",
      placeholder: "Enter your 12-digit Aadhar",
      required: true,
      autoComplete: "off"
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter password",
      required: true,
      autoComplete: "new-password"
    }
  ];

  return (
    <SignupForm
      userType="delivery-head"
      title="Delivery Head Registration"
      subtitle="Create your delivery management account"
      icon="🚚"
      primaryColor="accent"
      accentColor="secondary"
      loginLink="/delivery-head/login"
      loginText="Already have an account?"
      redirectPath="/delivery-head/login"
      endpoint="/auth/delivery-head/register"
      fields={fields}
    />
  );
}
