"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

// Authentication types
export const AUTH_TYPES = {
  GUEST: "guest",
  CLIENT: "client",
  ADMIN: "admin",
};

export const useAuthSystem = () => {
  const [authState, setAuthState] = useState({
    type: AUTH_TYPES.GUEST,
    user: null,
    loading: true,
    isAuthenticated: false,
  });

  const router = useRouter();

  // Check client authentication (database-based)
  const checkClientAuth = useCallback(async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return null;

      // Verify user exists in database
      const { data, error } = await supabase
        .from("applications")
        .select("id, email, first_name, last_name")
        .eq("id", userId)
        .single();

      if (data && !error) {
        return {
          type: AUTH_TYPES.CLIENT,
          user: data,
          isAuthenticated: true,
        };
      } else {
        // Invalid client session
        localStorage.removeItem("userId");
        return null;
      }
    } catch (err) {
      console.error("Client auth check error:", err);
      localStorage.removeItem("userId");
      return null;
    }
  }, []);
  // Check admin authentication (custom session-based)
  const checkAdminAuth = useCallback(async () => {
    try {
      // First check if we have a session cookie by calling the validation endpoint
      const response = await fetch("/api/admin-auth/validate", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.admin) {
          const adminData = {
            id: data.admin.id,
            email: data.admin.email,
            name:
              `${data.admin.first_name} ${data.admin.last_name}`.trim() ||
              data.admin.email,
            first_name: data.admin.first_name,
            last_name: data.admin.last_name,
            role: data.admin.role,
            department: data.admin.department,
          };

          // Update localStorage for backward compatibility
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("adminData", JSON.stringify(adminData));

          return {
            type: AUTH_TYPES.ADMIN,
            user: adminData,
            isAuthenticated: true,
          };
        }
      }

      // If API call failed, check localStorage as fallback (for backward compatibility)
      const adminAuth = localStorage.getItem("isLoggedIn");
      const adminData = localStorage.getItem("adminData");

      if (adminAuth === "true" && adminData) {
        try {
          const parsedAdminData = JSON.parse(adminData);
          // Verify the session is still valid by calling the API
          const validationResponse = await fetch("/api/admin-auth/validate", {
            method: "GET",
            credentials: "include",
          });

          if (validationResponse.ok) {
            return {
              type: AUTH_TYPES.ADMIN,
              user: parsedAdminData,
              isAuthenticated: true,
            };
          } else {
            // Session expired, clear localStorage
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("adminData");
          }
        } catch (parseError) {
          console.error("Error parsing admin data:", parseError);
          localStorage.removeItem("isLoggedIn");
          localStorage.removeItem("adminData");
        }
      }

      return null;
    } catch (err) {
      console.error("Admin auth check error:", err);
      // Clear potentially invalid localStorage data
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("adminData");
      return null;
    }
  }, []);
  // Main authentication check
  const checkAuthentication = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      // Check admin first (higher priority)
      const adminAuth = await checkAdminAuth();
      if (adminAuth) {
        setAuthState({
          ...adminAuth,
          loading: false,
        });
        return;
      }

      // Check client authentication
      const clientAuth = await checkClientAuth();
      if (clientAuth) {
        setAuthState({
          ...clientAuth,
          loading: false,
        });
        return;
      }

      // No authentication found
      setAuthState({
        type: AUTH_TYPES.GUEST,
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    } catch (err) {
      console.error("Authentication check failed:", err);
      setAuthState({
        type: AUTH_TYPES.GUEST,
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  }, [checkClientAuth, checkAdminAuth]); // Client login
  const clientLogin = useCallback(async (email, password) => {
    console.log("ClientLogin called with:", email);
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("id, email, first_name, last_name")
        .eq("email", email.toLowerCase().trim())
        .eq("password", password)
        .single();

      console.log("Database query result:", { data, error });
      if (data && !error) {
        // Store userId in localStorage immediately
        localStorage.setItem("userId", data.id);

        // Update auth state
        const newAuthState = {
          type: AUTH_TYPES.CLIENT,
          user: data,
          isAuthenticated: true,
          loading: false,
        };

        setAuthState(newAuthState);
        console.log(
          "Client login successful, auth state updated:",
          newAuthState
        );

        // Dispatch custom event to notify all components
        window.dispatchEvent(new Event("authStateChanged"));

        // Return success immediately
        return { success: true, user: data };
      } else {
        console.log("Database query failed:", error);
        return { success: false, error: "Invalid credentials" };
      }
    } catch (err) {
      console.error("Client login error:", err);
      return { success: false, error: "Login failed" };
    }
  }, []);
  // Admin login (custom session-based auth)
  const adminLogin = useCallback(
    async (email, password, rememberMe = false) => {
      try {
        const response = await fetch("/api/admin-auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email,
            password,
            remember_me: rememberMe,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          const adminData = {
            id: data.data.admin.id,
            email: data.data.admin.email,
            name:
              `${data.data.admin.first_name} ${data.data.admin.last_name}`.trim() ||
              data.data.admin.email,
            first_name: data.data.admin.first_name,
            last_name: data.data.admin.last_name,
            role: data.data.admin.role,
            department: data.data.admin.department,
          };

          // Store for backward compatibility
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("adminData", JSON.stringify(adminData));

          setAuthState({
            type: AUTH_TYPES.ADMIN,
            user: adminData,
            isAuthenticated: true,
            loading: false,
          });

          // Dispatch custom event to notify all components
          window.dispatchEvent(new Event("authStateChanged"));

          return { success: true, user: adminData };
        } else {
          return { success: false, error: data.error || "Login failed" };
        }
      } catch (err) {
        console.error("Admin login error:", err);
        return { success: false, error: "Network error occurred" };
      }
    },
    []
  );
  // Universal logout
  const logout = useCallback(async () => {
    try {
      // Call custom admin logout endpoint (if admin is logged in)
      const adminAuth = localStorage.getItem("isLoggedIn");
      if (adminAuth === "true") {
        await fetch("/api/admin-auth/login", {
          method: "DELETE",
          credentials: "include",
        });
      }

      // Also clear Supabase session for any remaining users
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }

    // Clear all possible auth data
    localStorage.removeItem("userId");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("adminData");

    setAuthState({
      type: AUTH_TYPES.GUEST,
      user: null,
      isAuthenticated: false,
      loading: false,
    });

    // Dispatch custom event to notify all components
    window.dispatchEvent(new Event("authStateChanged"));

    router.push("/");
  }, [router]);

  // Get navigation config based on auth state
  const getNavConfig = useCallback(() => {
    switch (authState.type) {
      case AUTH_TYPES.CLIENT:
        return {
          showVisaServices: false,
          showApplications: false,
          showCheckStatus: true,
          showContact: true,
          showCareers: true,
          primaryAction: {
            type: "link",
            href: `/student/${authState.user?.id}`,
            label: "My Portal",
            className:
              "text-appleGray-700 hover:text-sky-500 font-medium transition-colors duration-200",
          },
          secondaryAction: {
            type: "button",
            onClick: logout,
            label: "Logout",
            className:
              "bg-red-50 text-red-600 px-4 py-2 rounded-xl font-medium hover:bg-red-100 transition-colors duration-200 border border-red-200",
          },
        };

      case AUTH_TYPES.ADMIN:
        // Debug: Log the current user role to see what we're actually getting
        console.log("Current admin user role:", authState.user?.role);
        console.log("Full admin user data:", authState.user);

        // Check if user has admin or super admin role for Admin Management access
        // Make the check case-insensitive and handle potential whitespace
        const userRole = authState.user?.role?.toLowerCase()?.trim();
        const canManageAdmins =
          userRole === "admin" || userRole === "super_admin";

        console.log("Can manage admins:", canManageAdmins, "Role:", userRole);

        const adminDropdownItems = [
          {
            href: "/admin",
            label: "Dashboard",
            description: "Overview and analytics",
          },
        ];

        // Only add Admin Management if user has appropriate role
        if (canManageAdmins) {
          adminDropdownItems.push(
            {
              href: "/admin/admins",
              label: "Admin Management",
              description: "Manage admin users",
            },
            {
              href: "/admin/check-list",
              label: "Checklist Management",
              description: "Manage checklist items",
            },
            {
              href: "/admin/feedbacks",
              label: "Feedback Management",
              description: "Manage feedbacks",
            }
          );
        }

        // Add other menu items as needed
        // adminDropdownItems.push(
        //   {
        //     href: "/admin/entries",
        //     label: "Timeline Management",
        //     description: "Manage timeline events",
        //   },

        // );

        return {
          showVisaServices: false,
          showApplications: true,
          showCheckStatus: false, // Hide Check Status for admin
          showContact: false, // Hide Contact for admin
          showCareers: false,
          showAdminDropdown: true, // Add admin-specific dropdown
          adminDropdownItems,
          primaryAction: {
            type: "admin-dropdown",
            href: "/admin",
            label: "Admin Panel",
            className:
              "text-appleGray-700 hover:text-sky-500 font-medium transition-colors duration-200",
          },
          secondaryAction: {
            type: "button",
            onClick: logout,
            label: "Logout",
            className:
              "bg-red-50 text-red-600 px-4 py-2 rounded-xl font-medium hover:bg-red-100 transition-colors duration-200 border border-red-200",
          },
        };
      default: // GUEST
        return {
          showVisaServices: true,
          showApplications: false, // Only admins should see Applications menu
          showCheckStatus: true,
          showContact: true,
          showCareers: true,
          primaryAction: {
            type: "link",
            href: "/login",
            label: "Login",
            className:
              "bg-gradient-to-r from-sky-500 to-sky-600 text-white px-6 py-3 rounded-xl font-semibold btn-apple-hover shadow-soft",
          },
          secondaryAction: null,
        };
    }
  }, [authState, logout]);
  // Initialize auth check on mount
  useEffect(() => {
    console.log("useAuthSystem: Initial auth check");
    checkAuthentication();
  }, [checkAuthentication]);
  // Listen for storage changes (cross-tab sync) and auth state changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (["userId", "isLoggedIn", "adminData"].includes(e.key)) {
        checkAuthentication();
      }
    };

    const handleAuthStateChange = () => {
      checkAuthentication();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authStateChanged", handleAuthStateChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authStateChanged", handleAuthStateChange);
    };
  }, [checkAuthentication]);

  return {
    ...authState,
    clientLogin,
    adminLogin,
    logout,
    getNavConfig,
    checkAuthentication,
  };
};
