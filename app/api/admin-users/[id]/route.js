import { NextResponse } from "next/server";
import {
  requireAdminAuth,
  getDefaultPermissions,
} from "../../../../lib/adminAuth";
import { createClient } from "@supabase/supabase-js";

// Create service role client for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper function to validate UUID
const isValidUUID = (uuid) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// GET /api/admin-users/[id] - Get specific admin user
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid admin user ID" },
        { status: 400 }
      );
    }

    // Verify admin authentication and permissions
    const adminAuth = await requireAdminAuth(request, [
      "admin.read",
      "can_manage_admins",
    ]);

    if (!adminAuth.isAuthorized) {
      return adminAuth.response;
    }

    const { data: adminUser, error } = await supabaseAdmin
      .from("admin_users")
      .select(
        `
        id,
        email,
        first_name,
        last_name,
        role,
        department,
        is_active,
        created_at,
        last_login,
        permissions
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching admin user:", error);
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: adminUser,
    });
  } catch (error) {
    console.error("Admin user fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/admin-users/[id] - Update admin user
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid admin user ID" },
        { status: 400 }
      );
    }

    // Verify admin authentication and permissions
    const adminAuth = await requireAdminAuth(request, [
      "admin.update",
      "can_manage_admins",
    ]);

    if (!adminAuth.isAuthorized) {
      return adminAuth.response;
    }

    const body = await request.json();
    const { first_name, last_name, role, department, permissions, is_active } =
      body;

    // Validate role if provided
    if (role) {
      const validRoles = [
        "super_admin",
        "admin",
        "manager",
        "staff",
        "finance_manager",
      ];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: `Invalid role. Must be one of: ${validRoles.join(", ")}` },
          { status: 400 }
        );
      }
    }

    // Default permissions based on role - used for auto-updating permissions when role changes
    const defaultPermissions = {
      super_admin: getDefaultPermissions("super_admin"),
      admin: getDefaultPermissions("admin"),
      manager: getDefaultPermissions("manager"),
      staff: getDefaultPermissions("staff"),
      finance_manager: getDefaultPermissions("finance_manager"),
    };

    // Prepare update data (only include provided fields)
    const updateData = {};
    if (first_name !== undefined) updateData.first_name = first_name.trim();
    if (last_name !== undefined) updateData.last_name = last_name.trim();
    if (role !== undefined) {
      updateData.role = role;
      // Auto-update permissions when role changes (unless permissions are explicitly provided)
      if (permissions === undefined) {
        updateData.permissions =
          defaultPermissions[role] || defaultPermissions.staff;
        console.log(
          `🔄 Auto-updating permissions for role change to '${role}':`,
          updateData.permissions
        );
      }
    }
    if (department !== undefined)
      updateData.department = department?.trim() || null;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (is_active !== undefined) updateData.is_active = is_active;

    updateData.updated_at = new Date().toISOString();

    // Check if admin user exists
    const { data: existingAdmin, error: checkError } = await supabaseAdmin
      .from("admin_users")
      .select("id, email")
      .eq("id", id)
      .single();

    if (checkError || !existingAdmin) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      );
    }

    // Prevent self-deactivation for super admins
    if (
      is_active === false &&
      existingAdmin.id === adminAuth.adminData.id &&
      adminAuth.adminData.role === "super_admin"
    ) {
      return NextResponse.json(
        { error: "Cannot deactivate your own super admin account" },
        { status: 400 }
      );
    }

    // Update admin user
    const { data: updatedAdmin, error: updateError } = await supabaseAdmin
      .from("admin_users")
      .update(updateData)
      .eq("id", id)
      .select(
        `
        id,
        email,
        first_name,
        last_name,
        role,
        department,
        is_active,
        created_at,
        updated_at,
        permissions
      `
      )
      .single();

    if (updateError) {
      console.error("Error updating admin user:", updateError);
      return NextResponse.json(
        { error: "Failed to update admin user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedAdmin,
      message: "Admin user updated successfully",
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin-users/[id] - Delete/deactivate admin user
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    if (!isValidUUID(id)) {
      return NextResponse.json(
        { error: "Invalid admin user ID" },
        { status: 400 }
      );
    }

    // Verify admin authentication and permissions
    const adminAuth = await requireAdminAuth(request, [
      "admin.delete",
      "can_manage_admins",
    ]);

    if (!adminAuth.isAuthorized) {
      return adminAuth.response;
    }

    // Check if admin user exists
    const { data: existingAdmin, error: checkError } = await supabaseAdmin
      .from("admin_users")
      .select("id, email, role")
      .eq("id", id)
      .single();

    if (checkError || !existingAdmin) {
      return NextResponse.json(
        { error: "Admin user not found" },
        { status: 404 }
      );
    }

    // Prevent self-deletion
    if (existingAdmin.id === adminAuth.adminData.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Instead of hard delete, deactivate the user
    const { data: deactivatedAdmin, error: deactivateError } =
      await supabaseAdmin
        .from("admin_users")
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
        id,
        email,
        first_name,
        last_name,
        role,
        department,
        is_active
      `
        )
        .single();

    if (deactivateError) {
      console.error("Error deactivating admin user:", deactivateError);
      return NextResponse.json(
        { error: "Failed to deactivate admin user" },
        { status: 500 }
      );
    }

    // Also deactivate any active sessions for this admin
    await supabaseAdmin
      .from("admin_sessions")
      .update({ is_active: false })
      .eq("admin_id", id);

    return NextResponse.json({
      success: true,
      data: deactivatedAdmin,
      message: "Admin user deactivated successfully",
    });
  } catch (error) {
    console.error("Admin user deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
