import firebase from "firebase/compat/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { getAuth, sendEmailVerification } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { auth } from "../services/firebase";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const ui =
      firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(auth);

    const uiConfig: firebaseui.auth.Config = {
      callbacks: {
        signInSuccessWithAuthResult: function (authResult) {
          console.log("Auth Result:", authResult);
          if (authResult.additionalUserInfo?.isNewUser) {
            const authInstance = getAuth();
            console.log("New user detected:", authInstance.currentUser);

            if (authInstance.currentUser) {
              sendEmailVerification(authInstance.currentUser)
                .then(() => {
                  console.log("Verification email sent");
                  navigate("/sent-verify-mail");
                })
                .catch((error) => {
                  console.error("Error sending email verification:", error);
                });
            }
            return false;
          } else if (!authResult.user.emailVerified) {
            console.log("Email not verified:", authResult.user.email);
            navigate("/please-verify-mail");
            return false;
          }
          return true;
        },
        uiShown: function () {
          const loader = document.getElementById("loader");
          if (loader) loader.style.display = "none";
        },
      },
      signInFlow: "popup",
      signInSuccessUrl: `/dashboard`,
      signInOptions: [
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: false,
        },
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      ],
      tosUrl: "/",
      privacyPolicyUrl: "/",
    };

    ui.start("#firebaseui-auth-container", uiConfig);

    // Cleanup function to unmount UI instance
    return () => {
      ui.reset();
    };
  }, [navigate]);

  return (
    <div className="max-w-[1200px] w-full mx-auto flex flex-col gap-4 p-8 pt-[120px]">
      <div id="firebaseui-auth-container"></div>
      <div id="loader">Loading...</div>
    </div>
  );
};

export default Login;
