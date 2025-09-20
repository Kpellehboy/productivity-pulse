"use client"; // This is required because we use event handlers and state

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import the Link component
import { supabase } from "@/lib/supabase"; // Import the Supabase client we just created

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // To redirect the user after successful registration

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the page from refreshing
    setLoading(true);
    setError(null); // Reset any previous errors

    // 1. Sign up the user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message); // Show error message if something went wrong
    } else if (data.user) {
      // 2. If registration was successful, redirect to the login page
      alert("Registration successful! Please check your email for verification.");
      router.push("/");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center">Create an Account</h3>
        <form onSubmit={handleRegister}>
          {/* Email Input */}
          <div className="mt-4">
            <label htmlFor="email" className="block">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 mt-2 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="mt-4">
            <label htmlFor="password" className="block">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 mt-2 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-3 text-sm text-red-500">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-baseline justify-between mt-4">
            <button
              type="submit"
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-900"
              disabled={loading} // Disable button while loading
            >
              {loading ? "Loading..." : "Register"}
            </button>
            {/* Replace <a> with <Link> */}
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              Already have an account?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}