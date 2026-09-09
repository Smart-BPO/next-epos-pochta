"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, writeAuditLog } from "@/lib/cms/auth";
import {
  isAdminEmailTaken,
  isAdminPhoneTaken,
  updateAdminProfileFields,
} from "@/lib/cms/profile";
import { issueOtp, verifyOtp } from "@/lib/messaging/otp";
import { normalizeUzMsisdn } from "@/lib/sms/playmobile";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDashLocale } from "@/i18n/dashboard/server";

function revalidateProfile() {
  revalidatePath("/dashboard/profile/");
  revalidatePath("/dashboard/", "layout");
}

/** Revoke other sessions for this user; keep the current browser session. */
async function revokeOtherSessions() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const jwt = session?.access_token;
  if (!jwt) return;
  try {
    await createSupabaseAdminClient().auth.admin.signOut(jwt, "others");
  } catch (err) {
    console.error("[profile:revoke-sessions]", err);
  }
}

export async function updateProfileAction(formData: FormData) {
  const admin = await requireAdmin();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  if (!displayName) throw new Error("display_name_required");
  if (bio.length > 1000) throw new Error("bio_too_long");

  await updateAdminProfileFields(admin.id, {
    display_name: displayName,
    bio,
  });
  await writeAuditLog({
    actor: admin,
    action: "profile.update",
    entityType: "epos_admin_users",
    entityId: admin.id,
    payload: { display_name: displayName, bio_len: bio.length },
  });
  revalidateProfile();
}

export async function changePasswordAction(formData: FormData) {
  const admin = await requireAdmin();
  const currentPassword = String(formData.get("current_password") ?? "");
  const newPassword = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (newPassword.length < 8) throw new Error("password_too_short");
  if (newPassword !== confirm) throw new Error("password_mismatch");
  if (newPassword === currentPassword) throw new Error("password_unchanged");

  const supabase = await createSupabaseServerClient();
  const { error: signError } = await supabase.auth.signInWithPassword({
    email: admin.email,
    password: currentPassword,
  });
  if (signError) throw new Error("wrong_password");

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);

  await revokeOtherSessions();

  await writeAuditLog({
    actor: admin,
    action: "profile.password",
    entityType: "epos_admin_users",
    entityId: admin.id,
  });
  revalidateProfile();
}

export async function requestPhoneOtpAction(formData: FormData) {
  const admin = await requireAdmin();
  const locale = await getDashLocale();
  const phoneRaw = String(formData.get("phone") ?? "");
  const msisdn = normalizeUzMsisdn(phoneRaw);
  if (!msisdn) throw new Error("invalid_phone");

  if (await isAdminPhoneTaken(msisdn, admin.id)) {
    throw new Error("phone_taken");
  }

  const result = await issueOtp({
    channel: "sms",
    recipient: msisdn,
    purpose: "profile_phone",
    locale,
  });
  if (!result.ok) throw new Error(result.error);
  return { ok: true as const, phone: msisdn };
}

export async function confirmPhoneAction(formData: FormData) {
  const admin = await requireAdmin();
  const phoneRaw = String(formData.get("phone") ?? "");
  const code = String(formData.get("code") ?? "");
  const msisdn = normalizeUzMsisdn(phoneRaw);
  if (!msisdn) throw new Error("invalid_phone");

  const verified = await verifyOtp({
    channel: "sms",
    recipient: msisdn,
    code,
    purpose: "profile_phone",
  });
  if (!verified.ok) throw new Error(verified.error);

  if (await isAdminPhoneTaken(msisdn, admin.id)) {
    throw new Error("phone_taken");
  }

  await updateAdminProfileFields(admin.id, {
    phone: msisdn,
    phone_verified_at: new Date().toISOString(),
  });
  await writeAuditLog({
    actor: admin,
    action: "profile.phone",
    entityType: "epos_admin_users",
    entityId: admin.id,
    payload: { phone: msisdn.slice(-4) },
  });
  revalidateProfile();
}

export async function requestEmailOtpAction(formData: FormData) {
  const admin = await requireAdmin();
  const locale = await getDashLocale();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("invalid_email");
  }
  if (email === admin.email.toLowerCase()) {
    throw new Error("email_unchanged");
  }
  if (await isAdminEmailTaken(email, admin.id)) {
    throw new Error("email_taken");
  }

  const result = await issueOtp({
    channel: "email",
    recipient: email,
    purpose: "profile_email",
    locale,
  });
  if (!result.ok) throw new Error(result.error);
  return { ok: true as const, email };
}

export async function confirmEmailAction(formData: FormData) {
  const admin = await requireAdmin();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const code = String(formData.get("code") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("invalid_email");
  }

  const verified = await verifyOtp({
    channel: "email",
    recipient: email,
    code,
    purpose: "profile_email",
  });
  if (!verified.ok) throw new Error(verified.error);

  if (await isAdminEmailTaken(email, admin.id)) {
    throw new Error("email_taken");
  }

  const client = createSupabaseAdminClient();
  const { error } = await client.auth.admin.updateUserById(admin.id, {
    email,
    email_confirm: true,
  });
  if (error) throw new Error(error.message);

  await updateAdminProfileFields(admin.id, {
    email,
    email_verified_at: new Date().toISOString(),
  });

  await revokeOtherSessions();

  await writeAuditLog({
    actor: admin,
    action: "profile.email",
    entityType: "epos_admin_users",
    entityId: admin.id,
    payload: { email },
  });
  revalidateProfile();
}
