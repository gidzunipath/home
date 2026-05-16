"use client";

import { useState, useEffect } from "react";
import { useAdminAuth } from "../../../hooks/useAdminAuth";
import axios from "axios";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUser,
  FaUserShield,
  FaCrown,
  FaUserTie,
  FaSearch,
  FaFilter,
  FaEye,
  FaSave,
  FaTimes,
  FaCheck,
  FaEnvelope,
  FaFileInvoiceDollar,
} from "react-icons/fa";

export default function AdminManagementPage() {
  const { loading: authLoading, admin, isAuthenticated } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    role: "staff",
    department: "",
    password: "",
    create_auth_user: false,
  });

  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    role: "",
    department: "",
    is_active: true,
  });

  const roles = [
    {
      value: "super_admin",
      label: "Super Admin",
      icon: FaCrown,
      color: "text-purple-600",
    },
    {
      value: "admin",
      label: "Admin",
      icon: FaUserShield,
      color: "text-blue-600",
    },
    {
      value: "manager",
      label: "Manager",
      icon: FaUserTie,
      color: "text-green-600",
    },
    {
      value: "staff",
      label: "Student Visa Consultant",
      icon: FaUser,
      color: "text-gray-600",
    },
    {
      value: "finance_manager",
      label: "Finance Manager",
      icon: FaFileInvoiceDollar,
      color: "text-orange-600",
    },
  ];

  const getRoleInfo = (roleValue) => {
    return roles.find((r) => r.value === roleValue) || roles[3];
  };

  // Check if current admin can manage other admins
  const canManageAdmins = () => {
    if (!admin) return false;

    // Super admins can always manage admins
    if (admin.role === "super_admin") return true;

    // Check for specific permissions
    if (admin.permissions) {
      return (
        admin.permissions.can_manage_admins ||
        (admin.permissions["admin.create"] && admin.permissions["admin.update"])
      );
    }

    // Fallback for older admin accounts
    return admin.role === "admin";
  };

  // Test session validity
  const testSession = async () => {
    try {
      const response = await fetch("/api/admin-auth/validate", {
        credentials: "include",
      });
      const data = await response.json();

      if (response.ok) {
        setError(
          `✅ Session Valid: ${data.admin?.email} (${data.admin?.role})`
        );
      } else {
        setError(`❌ Session Invalid: ${data.error}`);
      }
    } catch (err) {
      setError(`❌ Session Test Failed: ${err.message}`);
    }
  };

  // Fetch admin users
  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError(""); // Clear any previous errors

      console.log("Fetching admins...");
      const response = await fetch("/api/admin-users", {
        credentials: "include",
      });

      console.log("Fetch admins response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Admins data:", data);
        setAdmins(data.data || []);
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.error || `Failed to fetch admin users (${response.status})`;
        console.error("Failed to fetch admins:", errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Error fetching admins:", err);
      const errorMessage = err.message || "Network error occurred";
      setError(`Failed to load admin users: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Create new admin
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    // Validate required fields
    if (
      !createForm.email ||
      !createForm.first_name ||
      !createForm.last_name ||
      !createForm.role
    ) {
      setError(
        "Please fill in all required fields (email, first name, last name, and role)"
      );
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createForm.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Check for duplicate email
    const emailExists = admins.some(
      (admin) => admin.email.toLowerCase() === createForm.email.toLowerCase()
    );
    if (emailExists) {
      setError("An admin with this email address already exists");
      return;
    }

    // Validate password if creating auth user
    if (
      createForm.create_auth_user &&
      (!createForm.password || createForm.password.length < 6)
    ) {
      setError(
        "Password must be at least 6 characters long when creating authentication account"
      );
      return;
    }

    try {
      console.log("🚀 Creating admin with data:", createForm);
      console.log("🔍 Auth user creation:", {
        create_auth_user: createForm.create_auth_user,
        hasPassword: !!createForm.password,
        passwordLength: createForm.password ? createForm.password.length : 0,
      });

      const response = await fetch("/api/admin-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(createForm),
      });

      console.log("📥 Response status:", response.status);
      console.log("📥 Response ok:", response.ok);

      const data = await response.json();
      console.log("📥 Response data:", data);

      if (response.ok) {
        // Track email sending status
        let emailSentSuccessfully = false;

        // Send welcome email to the newly created admin
        try {
          console.log("🔄 Preparing to send welcome email...");

          const emailTemp = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Gidz Uni Path Admin Team</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f4;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
                    <!-- Header with Logo -->
                    <div style="display: flex; align-items: center; justify-content: center; padding: 20px 0; background-color: #003366; margin-bottom: 30px;">
                        <img src="/gidz-transperant.png" style="height: 70px; width: auto; margin-right: 10px;" /> 
                        <h1 style="color: #ffffff; margin-left: 10px; font-size: 28px;">Gidz Uni Path</h1>
                    </div>
                    
                    <!-- Main Content -->
                    <div style="padding: 0 20px;">
                        <p style="font-size: 16px; margin-bottom: 20px;">Dear ${
                          createForm.first_name
                        } ${createForm.last_name},</p>
                        
                        <p style="font-size: 16px; margin-bottom: 20px;">Welcome to the Gidz Uni Path admin team! We're excited to have you join our mission of helping students achieve their dreams of studying in Germany.</p>

                        <div style="background-color: #f8f9fa; border-left: 4px solid #003366; padding: 20px; margin-bottom: 30px;">
                            <h2 style="color: #003366; margin: 0 0 15px 0; font-size: 20px;">Your Admin Account Details</h2>
                            <p style="margin: 5px 0;">Email: <strong>${
                              createForm.email
                            }</strong></p>
                            <p style="margin: 5px 0;">Role: <strong>${
                              getRoleInfo(createForm.role).label
                            }</strong></p>
                            ${
                              createForm.department
                                ? `<p style="margin: 5px 0;">Department: <strong>${createForm.department}</strong></p>`
                                : ""
                            }
                            ${
                              createForm.create_auth_user && createForm.password
                                ? `
                                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
                                    <h3 style="color: #003366; margin: 0 0 10px 0; font-size: 16px;">Login Credentials</h3>
                                    <p style="margin: 5px 0;">Username: <strong>${createForm.email}</strong></p>
                                    <p style="margin: 5px 0;">Password: <strong>${createForm.password}</strong></p>
                                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #666666;">Please change your password after your first login.</p>
                                </div>
                            `
                                : ""
                            }
                            <a href="https://www.gidzunipath.com/admin" style="display: inline-block; background-color: #003366; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; margin-top: 15px;">Access Admin Panel</a>
                        </div>

                        <!-- Admin Responsibilities -->
                        <div style="margin-bottom: 30px;">
                            <h2 style="color: #003366; font-size: 20px;">Your Responsibilities</h2>
                            <ul style="padding-left: 20px; margin-bottom: 15px;">
                                <li style="margin-bottom: 8px;">Review and manage student applications</li>
                                <li style="margin-bottom: 8px;">Assist students throughout their application process</li>
                                <li style="margin-bottom: 8px;">Maintain accurate records and documentation</li>
                                <li style="margin-bottom: 8px;">Provide excellent customer service</li>
                                ${
                                  createForm.role === "super_admin" ||
                                  createForm.role === "admin"
                                    ? '<li style="margin-bottom: 8px;">Manage other admin users and system settings</li>'
                                    : ""
                                }
                            </ul>
                        </div>

                        <!-- Contact Information -->
                        <div style="margin-bottom: 30px;">
                            <h2 style="color: #003366; font-size: 20px;">Need Help Getting Started?</h2>
                            <p style="margin-bottom: 15px;">Our team is here to support you! Contact us at:</p>
                            <ul style="list-style: none; padding: 0; margin: 0;">
                                <li style="margin-bottom: 10px;">
                                    <span style="color: #003366;">📞</span> 
                                    <strong>Phone:</strong> +49 155 66389194
                                    <div style="margin-left: 25px; color: #666666; font-size: 14px;">(Monday to Friday, 9:30 am to 5:00 pm)</div>
                                </li>
                                <li style="margin-bottom: 10px;">
                                    <span style="color: #003366;">✉</span>
                                    <strong>Email:</strong> 
                                    <a href="mailto:gidzunipath@gmail.com" style="color: #003366; text-decoration: none;">gidzunipath@gmail.com</a>
                                </li>
                            </ul>
                        </div>

                        <p style="margin-bottom: 30px;">We're thrilled to have you on our team and look forward to working together to make a difference in students' lives!</p>

                        <!-- Footer -->
                        <div style="border-top: 2px solid #f4f4f4; padding-top: 20px; text-align: center;">
                            <p style="color: #666666; font-size: 14px;">Best regards,<br>The Gidz Uni Path Management Team</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
          `;

          const emailPayload = {
            senderEmail: "gidzunipath@gmail.com",
            recipientEmail: createForm.email,
            subject: "Welcome to Gidz Uni Path Admin Team",
            template: emailTemp,
          };

          console.log("📧 Email payload prepared:", {
            senderEmail: emailPayload.senderEmail,
            recipientEmail: emailPayload.recipientEmail,
            subject: emailPayload.subject,
            templateLength: emailPayload.template.length,
          });

          const emailResponse = await axios.post(
            "/api/send_email",
            emailPayload
          );

          console.log("✅ Welcome email sent successfully:", {
            status: emailResponse.status,
            data: emailResponse.data,
            recipient: createForm.email,
          });

          emailSentSuccessfully = true;
        } catch (emailError) {
          console.error("❌ Error sending welcome email:", {
            error: emailError.message,
            status: emailError.response?.status,
            statusText: emailError.response?.statusText,
            data: emailError.response?.data,
            recipient: createForm.email,
          });

          // Log the full error for debugging
          if (emailError.response) {
            console.error("📧 Email API Response Error:", emailError.response);
          }

          // Don't fail the admin creation if email fails, but inform the user
          console.warn(
            "⚠️ Admin created successfully but welcome email failed to send"
          );
          emailSentSuccessfully = false;
        }

        setShowCreateModal(false);
        setCreateForm({
          email: "",
          first_name: "",
          last_name: "",
          role: "staff",
          department: "",
          password: "",
          create_auth_user: false,
        });
        fetchAdmins();

        // Show success message based on response
        const message = data.message || "Admin created successfully!";
        let successMessage = `✅ ${message}`;

        if (emailSentSuccessfully) {
          successMessage += ` Welcome email sent to ${createForm.email}`;
        } else {
          successMessage += ` (Note: Welcome email could not be sent - please notify the admin manually)`;
        }

        setError(successMessage);

        // Clear success message after 7 seconds
        setTimeout(() => {
          setError("");
        }, 7000);
      } else {
        const errorMessage =
          data.error || `Failed to create admin (${response.status})`;
        console.error("Admin creation failed:", errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Error creating admin:", err);
      const errorMessage = err.message || "Network error occurred";
      setError(`Network error: ${errorMessage}`);
    }
  };

  // Update admin
  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    try {
      // Check if role is being changed
      const isRoleChanged = editForm.role !== selectedAdmin.role;

      const response = await fetch(`/api/admin-users/${selectedAdmin.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setShowEditModal(false);
        setSelectedAdmin(null);
        fetchAdmins();

        // Show success message with role change notification
        if (isRoleChanged) {
          setError(
            `✅ Admin updated successfully! Role changed from ${
              getRoleInfo(selectedAdmin.role).label
            } to ${
              getRoleInfo(editForm.role).label
            }. Permissions have been automatically updated to match the new role.`
          );
        } else {
          setError("✅ Admin updated successfully!");
        }

        // Clear success message after 5 seconds
        setTimeout(() => {
          setError("");
        }, 5000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update admin");
      }
    } catch (err) {
      console.error("Error updating admin:", err);
      setError("Network error");
    }
  };

  // Delete/deactivate admin
  const handleDeleteAdmin = async (adminToDelete) => {
    if (
      !confirm(
        `Are you sure you want to deactivate ${adminToDelete.first_name} ${adminToDelete.last_name}?`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin-users/${adminToDelete.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        fetchAdmins();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete admin");
      }
    } catch (err) {
      console.error("Error deleting admin:", err);
      setError("Network error");
    }
  };

  // Open edit modal
  const openEditModal = (adminToEdit) => {
    setSelectedAdmin(adminToEdit);
    setEditForm({
      first_name: adminToEdit.first_name,
      last_name: adminToEdit.last_name,
      role: adminToEdit.role,
      department: adminToEdit.department || "",
      is_active: adminToEdit.is_active,
    });
    setShowEditModal(true);
  };

  // Filter admins
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || admin.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    if (isAuthenticated) {
      console.log("Admin authenticated:", admin);
      console.log("Admin role:", admin?.role);
      console.log("Admin permissions:", admin?.permissions);
      fetchAdmins();
    }
  }, [isAuthenticated, admin]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-appleGray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-sky-200 border-t-sky-500 mx-auto"></div>
          <div className="mt-6 space-y-2">
            <h3 className="text-xl font-semibold text-appleGray-800">
              Loading Admin Management
            </h3>
            <p className="text-appleGray-600">Fetching admin users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-appleGray-800">
                Admin Management
              </h1>
              <p className="text-appleGray-600 mt-2">
                Manage administrator accounts and permissions
              </p>
            </div>
            {canManageAdmins() ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 transition-colors duration-200 shadow-soft"
              >
                <FaPlus className="w-4 h-4" />
                <span>Add Admin</span>
              </button>
            ) : (
              <div className="bg-gray-100 text-gray-600 px-6 py-3 rounded-2xl flex items-center space-x-2">
                <FaUserShield className="w-4 h-4" />
                <span>Insufficient Permissions</span>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-soft border border-appleGray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-appleGray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-appleGray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="md:w-48">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-4 py-3 border border-appleGray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
              >
                <option value="all">All Roles</option>
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Permissions Notice */}
        {!canManageAdmins() && (
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-2xl p-4 mb-6">
            <div className="flex items-center">
              <FaUserShield className="h-5 w-5 text-amber-500 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-amber-800">
                  Limited Permissions
                </h3>
                <p className="text-amber-700 text-sm mt-1">
                  You can view admin users but cannot create, edit, or delete
                  them. Contact a Super Admin for admin management permissions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Debug Info for Development */}
        {process.env.NODE_ENV === "development" && admin && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-2xl p-4 mb-6">
            <div className="flex items-center">
              <FaUser className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <h3 className="text-sm font-semibold text-blue-800">
                  Debug Info (Development Only)
                </h3>
                <p className="text-blue-700 text-sm mt-1">
                  Logged in as: {admin.email} ({admin.role})
                </p>
                <p className="text-blue-700 text-sm">
                  Can manage admins: {canManageAdmins() ? "Yes" : "No"}
                </p>
                <details className="mt-2">
                  <summary className="text-blue-700 text-sm cursor-pointer">
                    View Permissions
                  </summary>
                  <pre className="text-xs mt-1 bg-blue-100 p-2 rounded overflow-auto">
                    {JSON.stringify(admin.permissions, null, 2)}
                  </pre>
                </details>
                <button
                  onClick={testSession}
                  className="mt-2 text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Test Session
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Display (Error or Success) */}
        {error && (
          <div
            className={`border-l-4 rounded-2xl p-6 mb-6 shadow-soft ${
              error.startsWith("✅")
                ? "bg-green-50 border-green-500"
                : "bg-red-50 border-red-500"
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {error.startsWith("✅") ? (
                  <FaCheck className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <FaTimes className="h-5 w-5 text-red-500 mt-0.5" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <h3
                  className={`text-sm font-semibold mb-1 ${
                    error.startsWith("✅") ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {error.startsWith("✅") ? "Success!" : "Error occurred"}
                </h3>
                <p
                  className={`text-sm leading-relaxed ${
                    error.startsWith("✅") ? "text-green-700" : "text-red-700"
                  }`}
                >
                  {error}
                </p>
                <button
                  onClick={() => setError("")}
                  className={`mt-3 text-sm font-medium underline focus:outline-none ${
                    error.startsWith("✅")
                      ? "text-green-600 hover:text-green-800"
                      : "text-red-600 hover:text-red-800"
                  }`}
                >
                  Dismiss {error.startsWith("✅") ? "message" : "error"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdmins.map((adminUser) => {
            const roleInfo = getRoleInfo(adminUser.role);
            const RoleIcon = roleInfo.icon;

            return (
              <div
                key={adminUser.id}
                className={`bg-white rounded-3xl p-6 shadow-soft border border-appleGray-200 hover:shadow-large transition-all duration-200 ${
                  !adminUser.is_active ? "opacity-60" : ""
                }`}
              >
                {/* Admin Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        adminUser.is_active ? "bg-sky-100" : "bg-gray-100"
                      }`}
                    >
                      <RoleIcon
                        className={`w-6 h-6 ${
                          adminUser.is_active ? roleInfo.color : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-appleGray-800">
                        {adminUser.first_name} {adminUser.last_name}
                      </h3>
                      <p className={`text-sm ${roleInfo.color} font-medium`}>
                        {roleInfo.label}
                      </p>
                    </div>
                  </div>

                  {!adminUser.is_active && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-lg font-medium">
                      Inactive
                    </span>
                  )}
                </div>

                {/* Admin Info */}
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-appleGray-600">
                    <span className="font-medium">Email:</span>{" "}
                    {adminUser.email}
                  </p>
                  {adminUser.department && (
                    <p className="text-sm text-appleGray-600">
                      <span className="font-medium">Department:</span>{" "}
                      {adminUser.department}
                    </p>
                  )}
                  <p className="text-sm text-appleGray-600">
                    <span className="font-medium">Created:</span>{" "}
                    {new Date(adminUser.created_at).toLocaleDateString()}
                  </p>
                  {adminUser.last_login && (
                    <p className="text-sm text-appleGray-600">
                      <span className="font-medium">Last Login:</span>{" "}
                      {new Date(adminUser.last_login).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  {canManageAdmins() ? (
                    <>
                      <button
                        onClick={() => openEditModal(adminUser)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-xl flex items-center justify-center space-x-2 transition-colors duration-200"
                      >
                        <FaEdit className="w-3 h-3" />
                        <span className="text-sm">Edit</span>
                      </button>

                      {adminUser.id !== admin?.id && (
                        <button
                          onClick={() => handleDeleteAdmin(adminUser)}
                          className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-xl flex items-center justify-center space-x-2 transition-colors duration-200"
                        >
                          <FaTrash className="w-3 h-3" />
                          <span className="text-sm">Delete</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex-1 bg-gray-50 text-gray-400 py-2 px-3 rounded-xl flex items-center justify-center space-x-2">
                      <FaEye className="w-3 h-3" />
                      <span className="text-sm">View Only</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredAdmins.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-appleGray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <FaUser className="w-12 h-12 text-appleGray-400" />
            </div>
            <h3 className="text-xl font-semibold text-appleGray-800 mb-2">
              No admins found
            </h3>
            <p className="text-appleGray-600">
              {searchTerm || roleFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Get started by adding your first admin user"}
            </p>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-large border border-appleGray-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-appleGray-800">
                  Add New Admin
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 bg-appleGray-100 hover:bg-appleGray-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                >
                  <FaTimes className="w-4 h-4 text-appleGray-600" />
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-appleGray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                    placeholder="admin@example.com"
                  />
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.first_name}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        first_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-appleGray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                    placeholder="John"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.last_name}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        last_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-appleGray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                    placeholder="Doe"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, role: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-appleGray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-appleGray-500 mt-1">
                    Permissions will be automatically assigned based on the
                    selected role
                  </p>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={createForm.department}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        department: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-appleGray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                    placeholder="IT, HR, Operations..."
                  />
                </div>

                {/* Create Auth User Option */}
                <div className="border-t border-appleGray-200 pt-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="create_auth_user"
                      checked={createForm.create_auth_user}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          create_auth_user: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-appleGray-300 rounded"
                    />
                    <label
                      htmlFor="create_auth_user"
                      className="text-sm text-appleGray-700"
                    >
                      Create authentication account
                    </label>
                  </div>
                  <p className="text-xs text-appleGray-500 mt-1 ml-7">
                    Allow this admin to login with email/password
                  </p>
                </div>

                {/* Password (if creating auth user) */}
                {createForm.create_auth_user && (
                  <div>
                    <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      required={createForm.create_auth_user}
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm({
                          ...createForm,
                          password: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-appleGray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                      placeholder="Enter secure password"
                      minLength={6}
                    />
                    <p className="text-xs text-appleGray-500 mt-1">
                      Minimum 6 characters
                    </p>
                  </div>
                )}

                {/* Email Notification Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <FaEnvelope className="h-5 w-5 text-blue-600 mt-0.5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800 mb-1">
                        📧 Email Notification
                      </h4>
                      <p className="text-blue-700 text-sm">
                        A welcome email will be automatically sent to the
                        admin&apos;s email address upon creation.
                        {createForm.create_auth_user
                          ? " The email will include login credentials (email and password)."
                          : " The email will include role details and admin panel access information."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 px-4 border border-appleGray-300 text-appleGray-700 rounded-2xl hover:bg-appleGray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <FaSave className="w-4 h-4" />
                    <span>Create Admin</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-large border border-appleGray-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-appleGray-800">
                  Edit Admin
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="w-8 h-8 bg-appleGray-100 hover:bg-appleGray-200 rounded-xl flex items-center justify-center transition-colors duration-200"
                >
                  <FaTimes className="w-4 h-4 text-appleGray-600" />
                </button>
              </div>

              <form onSubmit={handleUpdateAdmin} className="space-y-4">
                {/* Email (readonly) */}
                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={selectedAdmin.email}
                    readOnly
                    className="w-full px-4 py-3 border border-appleGray-300 rounded-2xl bg-appleGray-50 text-appleGray-600"
                  />
                  <p className="text-xs text-appleGray-500 mt-1">
                    Email cannot be changed
                  </p>
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.first_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, first_name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-appleGray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.last_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, last_name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-appleGray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-appleGray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                  >
                    {roles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {editForm.role !== selectedAdmin?.role && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0">
                          <FaUserShield className="h-4 w-4 text-blue-600 mt-0.5" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-800 font-medium">
                            Permissions Update
                          </p>
                          <p className="text-xs text-blue-700 mt-1">
                            Changing the role will automatically update
                            permissions to match the new role. Current:{" "}
                            {getRoleInfo(selectedAdmin?.role).label} → New:{" "}
                            {getRoleInfo(editForm.role).label}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-semibold text-appleGray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) =>
                      setEditForm({ ...editForm, department: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-appleGray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
                  />
                </div>

                {/* Active Status */}
                <div className="border-t border-appleGray-200 pt-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={editForm.is_active}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-appleGray-300 rounded"
                    />
                    <label
                      htmlFor="is_active"
                      className="text-sm text-appleGray-700"
                    >
                      Account is active
                    </label>
                  </div>
                  <p className="text-xs text-appleGray-500 mt-1 ml-7">
                    Inactive accounts cannot login
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-3 px-4 border border-appleGray-300 text-appleGray-700 rounded-2xl hover:bg-appleGray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <FaSave className="w-4 h-4" />
                    <span>Update Admin</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
