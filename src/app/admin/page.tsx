import AdminClient from "@/components/AdminClient";
export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default function AdminPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-black tracking-tight">Moderasi</h1>
      <AdminClient />
    </div>
  );
}
