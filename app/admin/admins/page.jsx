"use client";

import { useState, useEffect, useMemo } from "react";
import { useAdminAuth } from "../../../hooks/useAdminAuth";
import axios from "axios";
import { Icon } from "@iconify/react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaUserShield,
  FaEye,
  FaSave,
  FaTimes,
  FaCheck,
  FaEnvelope,
} from "react-icons/fa";
import { canManageAdmins } from "../components/adminNavConfig";
import { useAppModal } from "../../../hooks/useAppModal";

const ROLES = [
  {
    value: "super_admin",
    label: "Super Admin",
    icon: "mdi:crown",
    badge: "bg-purple-100 text-purple-800",
    avatar: "bg-purple-100 text-purple-600",
  },
  {
    value: "admin",
    label: "Admin",
    icon: "mdi:shield-account",
    badge: "bg-sky-100 text-sky-800",
    avatar: "bg-sky-100 text-sky-600",
  },
  {
    value: "manager",
    label: "Manager",
    icon: "mdi:account-tie",
    badge: "bg-emerald-100 text-emerald-800",
    avatar: "bg-emerald-100 text-emerald-600",
  },
  {
    value: "staff",
    label: "Student Visa Consultant",
    icon: "mdi:account",
    badge: "bg-appleGray-100 text-appleGray-800",
    avatar: "bg-appleGray-100 text-appleGray-600",
  },
  {
    value: "finance_manager",
    label: "Finance Manager",
    icon: "mdi:cash-multiple",
    badge: "bg-amber-100 text-amber-800",
    avatar: "bg-amber-100 text-amber-600",
  },
];

function getRoleInfo(roleValue) {
  return ROLES.find((r) => r.value === roleValue) || ROLES[3];
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminManagementPage() {
  const { showConfirm } = useAppModal();
  const { admin, isAuthenticated } = useAdminAuth();
  const canManage = canManageAdmins(admin);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

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

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin-users", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAdmins(data.data || []);
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.error || `Failed to fetch admin users (${response.status})`;
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

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setError("");

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(createForm.email)) {
      setError("Please enter a valid email address");
      return;
    }

    const emailExists = admins.some(
      (a) => a.email.toLowerCase() === createForm.email.toLowerCase()
    );
    if (emailExists) {
      setError("An admin with this email address already exists");
      return;
    }

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
      const response = await fetch("/api/admin-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (response.ok) {
        let emailSentSuccessfully = false;

        try {
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
                    <div style="display: flex; align-items: center; justify-content: center; padding: 20px 0; background-color: #003366; margin-bottom: 30px;">
                        <img src="/gidz-transperant.png" style="height: 70px; width: auto; margin-right: 10px;" /> 
                        <h1 style="color: #ffffff; margin-left: 10px; font-size: 28px;">Gidz Uni Path</h1>
                    </div>
                    
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

          await axios.post("/api/send_email", emailPayload);
          emailSentSuccessfully = true;
        } catch (emailError) {
          console.error("Error sending welcome email:", emailError);
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

        const message = data.message || "Admin created successfully!";
        let successMessage = `✅ ${message}`;

        if (emailSentSuccessfully) {
          successMessage += ` Welcome email sent to ${createForm.email}`;
        } else {
          successMessage += ` (Note: Welcome email could not be sent - please notify the admin manually)`;
        }

        setError(successMessage);
        setTimeout(() => setError(""), 7000);
      } else {
        const errorMessage =
          data.error || `Failed to create admin (${response.status})`;
        setError(errorMessage);
      }
    } catch (err) {
      console.error("Error creating admin:", err);
      const errorMessage = err.message || "Network error occurred";
      setError(`Network error: ${errorMessage}`);
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    try {
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
        setShowEditModal(false);
        setSelectedAdmin(null);
        fetchAdmins();

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

        setTimeout(() => setError(""), 5000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update admin");
      }
    } catch (err) {
      console.error("Error updating admin:", err);
      setError("Network error");
    }
  };

  const handleDeactivateAdmin = async (adminToDeactivate) => {
    const confirmed = await showConfirm({
      type: "warning",
      title: "Deactivate Admin",
      message: `Deactivate ${adminToDeactivate.first_name} ${adminToDeactivate.last_name}? They will no longer be able to sign in.`,
      confirmLabel: "Deactivate",
    });
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/admin-users/${adminToDeactivate.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setError(`✅ ${data.message || "Admin deactivated successfully"}`);
        fetchAdmins();
        setTimeout(() => setError(""), 5000);
      } else {
        setError(data.error || `Failed to deactivate admin (${response.status})`);
      }
    } catch (err) {
      console.error("Error deactivating admin:", err);
      setError("Network error while deactivating admin");
    }
  };

  const handleReactivateAdmin = async (adminToReactivate) => {
    try {
      const response = await fetch(`/api/admin-users/${adminToReactivate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_active: true }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setError(`✅ ${data.message || "Admin reactivated successfully"}`);
        fetchAdmins();
        setTimeout(() => setError(""), 5000);
      } else {
        setError(data.error || `Failed to reactivate admin (${response.status})`);
      }
    } catch (err) {
      console.error("Error reactivating admin:", err);
      setError("Network error while reactivating admin");
    }
  };

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

  const filteredAdmins = admins.filter((a) => {
    const matchesSearch =
      a.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || a.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const stats = useMemo(
    () => ({
      total: admins.length,
      active: admins.filter((a) => a.is_active).length,
      inactive: admins.filter((a) => !a.is_active).length,
      superAdmins: admins.filter((a) => a.role === "super_admin").length,
    }),
    [admins]
  );

  useEffect(() => {
    if (isAuthenticated) fetchAdmins();
  }, [isAuthenticated]);

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-br from-appleGray-50 via-white to-sky-50 p-6 sm:p-8">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <div className="mb-8 shrink-0">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-appleGray-800">
                Admin Management
              </h1>
              <p className="text-appleGray-600">
                Manage administrator accounts and permissions
              </p>
            </div>
            {canManage ? (
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-sky-600"
              >
                <FaPlus className="h-4 w-4" />
                Add Admin
              </button>
            ) : (
              <div className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-appleGray-200 bg-white px-5 py-2.5 text-sm font-medium text-appleGray-500">
                <FaUserShield className="h-4 w-4" />
                View only
              </div>
            )}
          </div>
        </div>

        <div className="mb-8 grid shrink-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Admins",
              value: stats.total,
              icon: "mdi:account-group",
              bg: "bg-sky-100",
              fg: "text-sky-600",
            },
            {
              label: "Active",
              value: stats.active,
              icon: "mdi:account-check",
              bg: "bg-emerald-100",
              fg: "text-emerald-600",
            },
            {
              label: "Inactive",
              value: stats.inactive,
              icon: "mdi:account-off",
              bg: "bg-red-100",
              fg: "text-red-600",
            },
            {
              label: "Super Admins",
              value: stats.superAdmins,
              icon: "mdi:crown",
              bg: "bg-purple-100",
              fg: "text-purple-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-appleGray-200 bg-white p-5 shadow-soft"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <Icon icon={stat.icon} className={`h-6 w-6 ${stat.fg}`} />
                </div>
                <div>
                  <p className="text-sm text-appleGray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-appleGray-800">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6 shrink-0 rounded-2xl border border-appleGray-200 bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Icon
                icon="mdi:magnify"
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-appleGray-400"
              />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-appleGray-200 bg-appleGray-50 py-2.5 pl-11 pr-4 text-sm text-appleGray-800 placeholder:text-appleGray-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
            <div className="md:w-56">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full rounded-xl border border-appleGray-200 bg-appleGray-50 px-4 py-2.5 text-sm text-appleGray-800 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="all">All Roles</option>
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!canManage && (
          <div className="mb-6 shrink-0 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <FaUserShield className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <h3 className="text-sm font-semibold text-amber-800">
                  Limited Permissions
                </h3>
                <p className="mt-1 text-sm text-amber-700">
                  You can view admin users but cannot create, edit, or delete
                  them. Contact a Super Admin for admin management permissions.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div
            className={`mb-6 shrink-0 rounded-2xl border-l-4 p-5 shadow-soft ${
              error.startsWith("✅")
                ? "border-green-500 bg-green-50"
                : "border-red-500 bg-red-50"
            }`}
          >
            <div className="flex items-start gap-3">
              {error.startsWith("✅") ? (
                <FaCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
              ) : (
                <FaTimes className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              )}
              <div className="flex-1">
                <h3
                  className={`mb-1 text-sm font-semibold ${
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
                   type="button"
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

        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-appleGray-200 bg-white shadow-soft">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
              <div className="flex flex-col items-center gap-3">
                <Icon
                  icon="mdi:loading"
                  className="h-10 w-10 animate-spin text-sky-500"
                />
                <p className="text-sm text-appleGray-600">Loading admins...</p>
              </div>
            </div>
          )}
          <div className="min-h-[min(70vh,560px)] flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-[1] bg-appleGray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                    Admin
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                    Department
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-appleGray-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-appleGray-200">
                {!loading && filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-24 text-center">
                      <Icon
                        icon="mdi:account-group-outline"
                        className="mx-auto mb-4 h-12 w-12 text-appleGray-400"
                      />
                      <p className="text-appleGray-600">
                        {searchTerm || roleFilter !== "all"
                          ? "No admins match your search or filter criteria."
                          : "No admin users yet. Add your first admin to get started."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((adminUser) => {
                    const roleInfo = getRoleInfo(adminUser.role);

                    return (
                      <tr
                        key={adminUser.id}
                        className={
                          adminUser.is_active
                            ? "transition-colors hover:bg-appleGray-50"
                            : "bg-appleGray-100 transition-colors hover:bg-appleGray-200"
                        }
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${roleInfo.avatar.split(" ")[0]}`}
                            >
                              <Icon
                                icon={roleInfo.icon}
                                className={`h-5 w-5 ${roleInfo.avatar.split(" ")[1]}`}
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-appleGray-800">
                                {adminUser.first_name} {adminUser.last_name}
                              </p>
                              {adminUser.last_login && (
                                <p className="text-xs text-appleGray-500">
                                  Last login: {formatDate(adminUser.last_login)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-appleGray-800">
                          {adminUser.email}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${roleInfo.badge}`}
                          >
                            <Icon icon={roleInfo.icon} className="h-3.5 w-3.5" />
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-appleGray-800">
                          {adminUser.department || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                              adminUser.is_active
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {adminUser.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-appleGray-800">
                          {formatDate(adminUser.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          {canManage ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(adminUser)}
                                className="inline-flex items-center gap-1 rounded-lg bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-100"
                              >
                                <FaEdit className="h-3.5 w-3.5" />
                                Edit
                              </button>
                              {adminUser.id !== admin?.id &&
                                (adminUser.is_active ? (
                                  <button
                                    type="button"
                                    onClick={() => handleDeactivateAdmin(adminUser)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
                                  >
                                    <FaTrash className="h-3.5 w-3.5" />
                                    Deactivate
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleReactivateAdmin(adminUser)}
                                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100"
                                  >
                                    <FaCheck className="h-3.5 w-3.5" />
                                    Reactivate
                                  </button>
                                ))}
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 rounded-lg bg-appleGray-50 px-3 py-1.5 text-sm font-medium text-appleGray-400">
                              <FaEye className="h-3.5 w-3.5" />
                              View only
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-appleGray-200 bg-white shadow-large">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-appleGray-800">
                  Add New Admin
                </h2>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-appleGray-100 transition-colors hover:bg-appleGray-200"
                >
                  <FaTimes className="h-4 w-4 text-appleGray-600" />
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-appleGray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    className="w-full rounded-2xl border border-appleGray-300 px-4 py-3 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-appleGray-700">
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
                    className="w-full rounded-2xl border border-appleGray-300 px-4 py-3 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-appleGray-700">
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
                    className="w-full rounded-2xl border border-appleGray-300 px-4 py-3 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Doe"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-appleGray-700">
                    Role *
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, role: e.target.value })
                    }
                    className="w-full rounded-2xl border border-appleGray-300 px-4 py-3 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-appleGray-500">
                    Permissions will be automatically assigned based on the
                    selected role
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-appleGray-700">
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
                    className="w-full rounded-2xl border border-appleGray-300 px-4 py-3 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="IT, HR, Operations..."
                  />
                </div>

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
                      className="h-4 w-4 rounded border-appleGray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <label
                      htmlFor="create_auth_user"
                      className="text-sm text-appleGray-700"
                    >
                      Create authentication account
                    </label>
                  </div>
                  <p className="ml-7 mt-1 text-xs text-appleGray-500">
                    Allow this admin to login with email/password
                  </p>
                </div>

                {createForm.create_auth_user && (
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-appleGray-700">
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
                      className="w-full rounded-2xl border border-appleGray-300 px-4 py-3 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Enter secure password"
                      minLength={6}
                    />
                    <p className="mt-1 text-xs text-appleGray-500">
                      Minimum 6 characters
                    </p>
                  </div>
                )}

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start space-x-3">
                    <FaEnvelope className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <div>
                      <h4 className="mb-1 text-sm font-semibold text-blue-800">
                        Email Notification
                      </h4>
                      <p className="text-sm text-blue-700">
                        A welcome email will be automatically sent to the
                        admin&apos;s email address upon creation.
                        {createForm.create_auth_user
                          ? " The email will include login credentials (email and password)."
                          : " The email will include role details and admin panel access information."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 rounded-2xl border border-appleGray-300 px-4 py-3 text-appleGray-700 transition-colors hover:bg-appleGray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex flex-1 items-center justify-center space-x-2 rounded-2xl bg-sky-500 px-4 py-3 text-white transition-colors hover:bg-sky-600"
                  >
                    <FaSave className="h-4 w-4" />
                    <span>Create Admin</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-appleGray-200 bg-white shadow-large">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-appleGray-800">
                  Edit Admin
                </h2>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-appleGray-100 transition-colors hover:bg-appleGray-200"
                >
                  <FaTimes className="h-4 w-4 text-appleGray-600" />
                </button>
              </div>

              <form onSubmit={handleUpdateAdmin} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-appleGray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={selectedAdmin.email}
                    readOnly
                    className="w-full rounded-2xl border border-appleGray-300 bg-appleGray-50 px-4 py-3 text-appleGray-600"
                  />
                  <p className="mt-1 text-xs text-appleGray-500">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-appleGray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.first_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, first_name: e.target.value })
                    }
                    className="w-full rounded-2xl border border-appleGray-300 px-4 py-3 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-appleGray-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.last_name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, last_name: e.target.value })
                    }
                    className="w-full rounded-2xl border border-appleGray-300 px-4 py-3 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-appleGray-700">
                    Role *
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({ ...editForm, role: e.target.value })
                    }
                    className="w-full rounded-2xl border border-appleGray-300 px-4 py-3 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {editForm.role !== selectedAdmin?.role && (
                    <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
                      <div className="flex items-start space-x-2">
                        <Icon
                          icon="mdi:shield-account"
                          className="mt-0.5 h-4 w-4 shrink-0 text-blue-600"
                        />
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Permissions Update
                          </p>
                          <p className="mt-1 text-xs text-blue-700">
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

                <div>
                  <label className="mb-2 block text-sm font-semibold text-appleGray-700">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editForm.department}
                    onChange={(e) =>
                      setEditForm({ ...editForm, department: e.target.value })
                    }
                    className="w-full rounded-2xl border border-appleGray-300 px-4 py-3 transition-all focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

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
                      className="h-4 w-4 rounded border-appleGray-300 text-sky-600 focus:ring-sky-500"
                    />
                    <label
                      htmlFor="is_active"
                      className="text-sm text-appleGray-700"
                    >
                      Account is active
                    </label>
                  </div>
                  <p className="ml-7 mt-1 text-xs text-appleGray-500">
                    Inactive accounts cannot login
                  </p>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 rounded-2xl border border-appleGray-300 px-4 py-3 text-appleGray-700 transition-colors hover:bg-appleGray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex flex-1 items-center justify-center space-x-2 rounded-2xl bg-sky-500 px-4 py-3 text-white transition-colors hover:bg-sky-600"
                  >
                    <FaSave className="h-4 w-4" />
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
