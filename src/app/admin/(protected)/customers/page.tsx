import Link from "next/link";
import { Users } from "lucide-react";
import { prisma } from "@/lib/db";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
      <p className="mt-1 text-sm text-slate-500">Profiles are matched automatically by phone number.</p>

      <div className="card mt-6 overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Bookings</th>
              <th>Since</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <Users className="mx-auto mb-2 h-6 w-6" />
                  No customers yet.
                </td>
              </tr>
            )}
            {customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link href={`/admin/customers/${c.id}`} className="font-semibold text-sky-700 hover:underline">
                    {c.firstName} {c.lastName}
                  </Link>
                </td>
                <td className="text-slate-500">{c.phone}</td>
                <td className="text-slate-500">{c.email ?? "—"}</td>
                <td>
                  <span className="chip bg-slate-100 text-slate-600">{c._count.bookings}</span>
                </td>
                <td className="text-xs text-slate-400">{c.createdAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
