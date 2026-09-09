import { notFound } from "next/navigation";

import { BackButton } from "@/components/layout/back-button";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/auth/admin";
import { getAdminAccountsOverview } from "@/lib/services/admin/queries";

function formatDate(date: Date | null): string {
  if (!date) return "Never";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

export default async function AdminPage() {
  const session = await auth();
  if (!isAdminEmail(session?.user?.email)) notFound();

  const accounts = await getAdminAccountsOverview();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
      <BackButton fallbackHref="/" />
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Admin</h1>
        <p className="text-muted-foreground text-sm">
          {accounts.length} account{accounts.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Joined</th>
              <th className="p-3 font-medium">Items</th>
              <th className="p-3 font-medium">Lists</th>
              <th className="p-3 font-medium">Last active</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id} className="border-b last:border-b-0">
                <td className="p-3">{account.email}</td>
                <td className="text-muted-foreground p-3">
                  {account.name ?? "—"}
                </td>
                <td className="text-muted-foreground p-3">
                  {formatDate(account.createdAt)}
                </td>
                <td className="p-3">{account.itemCount}</td>
                <td className="p-3">{account.listCount}</td>
                <td className="text-muted-foreground p-3">
                  {formatDate(account.lastActiveAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
