"use server";

export async function updateWorkspaceSettings(formData: FormData) {
  const name = formData.get("workspaceName") as string;
  const timezone = formData.get("timezone") as string;
  console.log(`Update workspace: ${name}, ${timezone}`);
}

export async function updateNotificationPreferences(formData: FormData) {
  // Process notification toggles
  console.log("Update notification preferences");
}
