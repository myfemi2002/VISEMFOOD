import { saveWhatsAppSettingsAction } from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminWhatsAppSettingsPage() {
  await requireRole(["SUPER_ADMIN", "CONTENT_MANAGER"]);
  const settings = await prisma.whatsAppSetting.findUnique({ where: { singletonKey: "default" } }).catch(() => null);

  return (
    <form action={saveWhatsAppSettingsAction} className="card grid gap-4 p-6">
      <h2 className="font-display text-2xl text-ink">WhatsApp Settings</h2>
      <input name="adminPhoneNumber" defaultValue={settings?.adminPhoneNumber ?? ""} placeholder="Admin phone number" required />
      <textarea name="defaultOrderMessage" rows={4} defaultValue={settings?.defaultOrderMessage ?? ""} placeholder="Default order message" required />
      <textarea name="defaultTrayMessage" rows={4} defaultValue={settings?.defaultTrayMessage ?? ""} placeholder="Default tray message" required />
      <textarea name="defaultCateringMessage" rows={4} defaultValue={settings?.defaultCateringMessage ?? ""} placeholder="Default catering message" required />
      <label className="flex items-center gap-3 text-sm text-ink-soft">
        <input type="checkbox" name="isEnabled" defaultChecked={settings?.isEnabled ?? true} className="h-4 w-4" />
        Enabled
      </label>
      <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">Save WhatsApp Settings</button>
    </form>
  );
}
