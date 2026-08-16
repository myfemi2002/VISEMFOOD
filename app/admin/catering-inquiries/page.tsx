import { saveInquiryStatusAction } from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminCateringInquiriesPage() {
  await requireRole(["SUPER_ADMIN", "OPERATIONS_STAFF"]);
  const inquiriesQuery = prisma.cateringInquiry.findMany({ orderBy: { createdAt: "desc" } });
  const inquiries = await inquiriesQuery.catch(() => [] as Awaited<typeof inquiriesQuery>);

  return (
    <div className="space-y-4">
      {inquiries.map((item: (typeof inquiries)[number]) => (
        <form
          key={item.id}
          action={saveInquiryStatusAction}
          className="card grid gap-4 p-6 lg:grid-cols-[1fr,220px]"
        >
          <input type="hidden" name="type" value="catering" />
          <input type="hidden" name="id" value={item.id} />
          <div>
            <h2 className="font-display text-2xl text-ink">{item.fullName}</h2>
            <p className="mt-2 text-sm text-ink-soft">{item.email} | {item.phone} | {item.eventType}</p>
            <textarea
              name="internalNotes"
              rows={4}
              className="mt-4"
              defaultValue={item.internalNotes ?? ""}
              placeholder="Internal notes"
            />
          </div>
          <div className="space-y-3">
            <select name="status" defaultValue={item.status}>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CLOSED">Closed</option>
            </select>
            <button className="w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              Save Update
            </button>
          </div>
        </form>
      ))}
    </div>
  );
}
