import { FcGoogle } from "react-icons/fc";
import Button from "./Button";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const GoogleAuthButton = ({ onSuccess }: { onSuccess: any }) => {
  return (
    <div className="google-btn">
      <GoogleLogin
        useOneTap={true}
        size="large"
        width={"100%"}
        context={"use"}
        auto_select={true}
        onSuccess={async (res) => {
          try {
            const response = await axios.post("auth/google-login", {
              credential: res.credential,
            });
            onSuccess(response.data);
          } catch (err) {
            console.error("Google login error:", err);
          }
        }}
        onError={() => {
          console.log("err");
        }}
      />
    </div>
  );
};

export default GoogleAuthButton;
