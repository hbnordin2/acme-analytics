"use server";

// These are placeholder server actions that demonstrate the pattern.
// In a real app they'd call the backend API and revalidate caches.

export async function toggleAlertAction(alertId: string, active: boolean) {
  // Would call: PATCH /api/alerts/:id { active }
  // Then: revalidateTag("alerts")
  console.log(`Toggle alert ${alertId} to ${active}`);
}

export async function deleteAlertAction(alertId: string) {
  // Would call: DELETE /api/alerts/:id
  // Then: revalidateTag("alerts")
  console.log(`Delete alert ${alertId}`);
}
