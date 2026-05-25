"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useAuthSystem, AUTH_TYPES } from "../../hooks/useAuthSystem";
import {
  FaEye,
  FaEyeSlash,
  FaLock,
  FaEnvelope,
  FaShieldAlt,
  FaUserShield,
} from "react-icons/fa";
import Image from "next/image";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const {
    type: authType,
    user,
    isAuthenticated,
    clientLogin,
  } = useAuthSystem();

  // Only check for existing auth on mount, not on every auth change
  useEffect(() => {
    const checkExistingAuth = () => {
      if (isAuthenticated && authType === AUTH_TYPES.CLIENT && user?.id) {
        console.log(
          "Already authenticated on mount, redirecting to client portal:",
          user.id
        );
        router.replace("/student/" + user.id);
      }
    };

    // Only run this check once on mount
    checkExistingAuth();
  }, [isAuthenticated, authType, user?.id, router]); // Include all dependencies

  // Toggle password visibility
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setErrorMsg("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // Use the auth system's client login function
      console.log("Attempting login with email:", email);
      const result = await clientLogin(email, password);
      console.log("Login result:", result);

      if (result.success) {
        console.log(
          "Login successful, redirecting to:",
          "/student/" + result.user.id
        );
        // Use replace instead of push to avoid back button issues
        router.replace("/student/" + result.user.id);
      } else {
        console.log("Login failed:", result.error);
        setErrorMsg(
          result.error ||
            "Invalid email or password. Please check your credentials and try again."
        );
      }
    } catch (err) {
      console.error("Login error:", err);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-appleGray-50 via-white to-sky-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-sky-500/5 via-transparent to-sky-600/5"></div>

      {/* Floating Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-sky-400/10 rounded-full animate-float"></div>
      <div
        className="absolute top-40 right-20 w-24 h-24 bg-sky-500/20 rounded-2xl animate-float"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute bottom-40 left-20 w-20 h-20 bg-sky-600/15 rounded-full animate-float"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute top-60 right-40 w-16 h-16 bg-sky-400/25 rounded-full animate-float"
        style={{ animationDelay: "3s" }}
      ></div>

      <div className="relative flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          {/* Hero Section */}
          <div className="text-center mb-8 animate-fade-in-up">
            {/* Logo/Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-sky-500 to-sky-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-soft">
              <FaUserShield className="w-10 h-10 text-white" />
            </div>

            {/* Login Image */}
            {/* <div className="w-32 h-32 mx-auto mb-6 rounded-2xl overflow-hidden shadow-soft">
              <Image
                src="/logo.png"
                alt="GIDZ Uni Path Logo"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div> */}

            <h1 className="text-3xl lg:text-4xl font-bold text-appleGray-800 mb-2">
              Welcome Back
            </h1>
            <p className="text-lg text-appleGray-600">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-3xl p-8 shadow-large border border-appleGray-200">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-appleGray-700"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="hidden absolute inset-y-0 left-0 pl-4 md:flex items-center pointer-events-none">
                    <FaEnvelope className="w-4 h-4 text-appleGray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-11 pr-4 py-3 text-sm border border-appleGray-300 rounded-2xl shadow-soft bg-appleGray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-appleGray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="hidden absolute inset-y-0 left-0 pl-4 md:flex items-center pointer-events-none">
                    <FaLock className="w-4 h-4 text-appleGray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-11 pr-12 py-3 text-sm border border-appleGray-300 rounded-2xl shadow-soft bg-appleGray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-appleGray-400 hover:text-appleGray-600 focus:outline-none transition-colors duration-200"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-4 h-4" />
                    ) : (
                      <FaEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl shadow-soft hover:from-sky-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transition-all duration-300 ${
                  loading ? "opacity-50 cursor-not-allowed" : "btn-apple-hover"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <FaShieldAlt className="w-4 h-4" />
                    <span>Sign In</span>
                  </div>
                )}
              </button>
            </form>

            {/* Security Badge */}
            <div className="mt-6 pt-6 border-t border-appleGray-200">
              <div className="flex items-center justify-center space-x-2 text-sm text-appleGray-500">
                <FaShieldAlt className="w-4 h-4" />
                <span>Your data is secure and encrypted</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-appleGray-500">
              Need help? Contact our support team
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
