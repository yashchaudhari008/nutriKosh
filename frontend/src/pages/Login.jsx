import { GoogleLogin } from "@react-oauth/google";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { user, loginWithGoogleIdToken } = useAuth();

  if (user) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-sm space-y-6 rounded-lg border bg-white p-8 shadow-sm">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">nutriKosh</h1>
          <p className="text-sm text-slate-500">Track your protein and weight, every day.</p>
        </div>
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={(credentialResponse) => loginWithGoogleIdToken(credentialResponse.credential)}
            onError={() => console.error("Google sign-in failed")}
          />
        </div>
      </div>
    </div>
  );
}
