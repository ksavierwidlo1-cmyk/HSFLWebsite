"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to EBA
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to access your player profile
            </p>
          </div>

          {/* Roblox Sign In Button */}
          <button
            onClick={() => signIn("roblox", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M18.926 23.998 12.003.014 5.072 24l6.854-2.021 7-.98zM14.474 17.654l-2.474.346-2.477-.346L8.201 6.308l3.8 1.336 3.802-1.336-1.329 11.346z" />
            </svg>
            <span>Continue with Roblox</span>
          </button>

          {/* Info Text */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p className="mb-2">First time signing in?</p>
            <p className="text-xs">
              If your Roblox username is already registered, you'll be logged into your existing profile.
              Otherwise, a new Eligible Athlete profile will be created for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
