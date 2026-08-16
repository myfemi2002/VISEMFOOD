import { saveOrderAction } from "@/app/admin/actions";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminOrdersPage() {
  await requireRole(["SUPER_ADMIN", "OPERATIONS_STAFF"]);
  const ordersQuery = prisma.order.findMany({ orderBy: { createdAt: "desc" } });
  const orders = await ordersQuery.catch(() => [] as Awaited<typeof ordersQuery>);

  return (
    <div className="space-y-6">
      {[{ id: "", orderReference: "", customerName: "", customerPhone: "", customerEmail: "", orderType: "PRODUCT", source: "WHATSAPP", status: "PENDING", totalAmount: "", pickupOrDelivery: "", deliveryAddress: "", orderNotes: "" }, ...orders].map((order: (typeof orders)[number] | { id: string; orderReference: string; customerName: string; customerPhone: string; customerEmail: string; orderType: string; source: string; status: string; totalAmount: string; pickupOrDelivery: string; deliveryAddress: string; orderNotes: string }, index) => (
        <form key={order.id || "new"} action={saveOrderAction} className="card grid gap-4 p-6 lg:grid-cols-2">
          <input type="hidden" name="id" defaultValue={order.id} />
          <h2 className="font-display text-2xl text-ink lg:col-span-2">{index === 0 ? "Log Confirmed WhatsApp Order" : order.orderReference}</h2>
          <input name="customerName" placeholder="Customer name" defaultValue={order.customerName} required />
          <input name="customerPhone" placeholder="Customer phone" defaultValue={order.customerPhone} required />
          <input name="customerEmail" type="email" placeholder="Customer email" defaultValue={order.customerEmail ?? ""} />
          <input name="totalAmount" type="number" step="0.01" placeholder="Total amount" defaultValue={order.totalAmount ? String(order.totalAmount) : ""} />
          <select name="orderType" defaultValue={order.orderType}>
            <option value="PRODUCT">Product</option>
            <option value="TRAY_PACKAGE">Tray Package</option>
            <option value="CATERING">Catering</option>
          </select>
          <select name="source" defaultValue={order.source}>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="ADMIN_MANUAL">Admin Manual</option>
            <option value="CONTACT_FOLLOWUP">Contact Follow-up</option>
          </select>
          <select name="status" defaultValue={order.status}>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY">Ready</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <input name="pickupOrDelivery" placeholder="Pickup or delivery" defaultValue={order.pickupOrDelivery ?? ""} />
          <textarea name="deliveryAddress" placeholder="Delivery address" rows={3} defaultValue={order.deliveryAddress ?? ""} className="lg:col-span-2" />
          <textarea name="orderNotes" placeholder="Order notes" rows={4} defaultValue={order.orderNotes ?? ""} className="lg:col-span-2" />
          <button className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white lg:col-span-2">
            {index === 0 ? "Create Order Record" : "Save Order"}
          </button>
        </form>
      ))}
    </div>
  );
}
