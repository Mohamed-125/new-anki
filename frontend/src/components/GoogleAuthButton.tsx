import { FcGoogle } from "react-icons/fc";
import Button from "./Button";

const GoogleAuthButton = () => {
  const handleGoogleAuth = async () => {
    // try {
    //   window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
    // } catch (error) {
    //   console.error("Google auth error:", error);
    // }
  };

  return (
    <Button
      onClick={handleGoogleAuth}
      size="parent"
      className="flex justify-center items-center py-2 mt-4 w-full text-gray-700 bg-white rounded-md border-2 border-gray-200 transition-colors hover:bg-gray-50"
    >
      <FcGoogle className="mr-2 text-xl" />
      Continue with Google
    </Button>
  );
};

export default GoogleAuthButton;
