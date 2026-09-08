"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Role = "boss" | "shopmanager" | "frame" | "carpenter";
type User = { id: string; name: string; email: string; role: Role };
const roles: Role[] = ["boss", "shopmanager", "frame", "carpenter"];

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("shopmanager");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Unable to load users");
        setUsers(data.users);
      })
      .catch((reason: Error) => toast.error(reason.message))
      .finally(() => setLoading(false));
  }, []);

  async function addUser(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await response.json();
    setSaving(false);
    if (!response.ok) {
      toast.error(data.error || "Unable to create user");
      return;
    }
    setUsers((current) => [...current, data.user]);
    setName("");
    setEmail("");
    setPassword("");
    setRole("shopmanager");
    toast.success("User created successfully.");
  }

  async function deleteUser(id: string) {
    if (!window.confirm("Delete this user? They will no longer be able to sign in.")) return;
    const response = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error || "Unable to delete user");
      return;
    }
    setUsers((current) => current.filter((user) => user.id !== id));
    toast.success("User deleted successfully.");
  }

  return (
    <main className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">User Management</h2>
        <p className="mt-1 text-sm text-gray-600">Create and remove admin accounts.</p>
      </div>
      <form onSubmit={addUser} className="max-w-2xl space-y-4 rounded-lg border bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900">Add User</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <input aria-label="Name" placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} required className="rounded border px-3 py-2 text-sm" />
          <input aria-label="Email" type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} required className="rounded border px-3 py-2 text-sm" />
          <input aria-label="Password" type="password" placeholder="Temporary password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} className="rounded border px-3 py-2 text-sm" />
          <select aria-label="Role" value={role} onChange={(event) => setRole(event.target.value as Role)} className="rounded border px-3 py-2 text-sm">
            {roles.map((option) => <option key={option} value={option}>{option}</option>)}
          </select>
        </div>
        <button type="submit" disabled={saving} className="rounded bg-[#16171C] hover:bg-green-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? "Creating..." : "Create User"}</button>
      </form>

      <section className="rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Existing users</h3>
        {loading ? <p className="text-sm text-gray-600">Loading users...</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-gray-600"><tr><th className="px-2 py-3">Name</th><th className="px-2 py-3">Email</th><th className="px-2 py-3">Role</th><th className="px-2 py-3 text-right">Action</th></tr></thead>
              <tbody>{users.map((user) => <tr key={user.id} className="border-b last:border-0"><td className="px-2 py-3 font-medium">{user.name}</td><td className="px-2 py-3">{user.email}</td><td className="px-2 py-3 capitalize">{user.role}</td><td className="px-2 py-3 text-right"><button type="button" onClick={() => deleteUser(user.id)} className="text-red-600 hover:text-red-800">Delete</button></td></tr>)}</tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}