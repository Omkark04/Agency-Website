import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";

interface SocialLoginButtonsProps {
  onGoogleLogin: () => void;
  onLinkedInLogin: () => void;
  loading?: boolean;
}

export default function SocialLoginButtons({
  onGoogleLogin,
  onLinkedInLogin,
  loading = false,
}: SocialLoginButtonsProps) {
  return (
    <div className="space-y-3">
      {/* GOOGLE LOGIN */}
      <button
        onClick={onGoogleLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FcGoogle className="text-2xl" />
        <span className="font-medium text-gray-700">Continue with Google</span>
      </button>

      {/* LINKEDIN LOGIN */}
      <button
        onClick={onLinkedInLogin}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-blue-600 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <FaLinkedin className="text-2xl" />
        <span className="font-medium">Continue with LinkedIn</span>
      </button>
    </div>
  );
}
