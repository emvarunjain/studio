"use server";

import { reloadAppConfig, getConfig } from '@/lib/config';
// In a real app, you would add admin authorization checks here.
// For example, verify the user session and check for an admin role.

export async function reloadConfigAction() {
  // Add admin authorization check here if needed
  // e.g., const user = await getCurrentUser(); if (!user.isAdmin) throw new Error("Unauthorized");
  console.log("Admin action: reloadConfigAction called");
  try {
    const newConfig = await reloadAppConfig();
    return newConfig;
  } catch (error: any) {
    console.error("Error in reloadConfigAction:", error);
    throw new Error(error.message || "Failed to reload configuration.");
  }
}

export async function getCurrentConfigAction() {
  // Add admin authorization check here
  console.log("Admin action: getCurrentConfigAction called");
  try {
    const currentConfig = await getConfig();
    return currentConfig;
  } catch (error: any) {
    console.error("Error in getCurrentConfigAction:", error);
    throw new Error(error.message || "Failed to fetch current configuration.");
  }
}
