import { useEffect, useState } from "react";
import api from "../api/axios.js";
import StatCard from "../components/StatCard.jsx";
import TrustBadge from "../components/TrustBadge.jsx";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("overview");
  const [donations, setDonations] = useState([]);

  const load = async () => {
    const [a, u] = await Promise.all([api.get("/admin/analytics"), api.get("/admin/users")]);
    setAnalytics(a.data.analytics);
    setUsers(u.data.users);
  };

  const loadDonations = async () => {
    const { data } = await api.get("/admin/donations");
    setDonations(data.donations);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (tab === "donations" && donations.length === 0) loadDonations();
  }, [tab]);

  const verify = async (id) => {
    await api.patch(`/admin/users/${id}/verify`);
    await load();
  };

  const toggleActive = async (u) => {
    await api.patch(`/admin/users/${u._id}/status`, { isActive: !u.isActive });
    await load();
  };

  if (!analytics) {
    return <div className="min-h-[60vh] grid place-items-center text-basil-950/50 text-sm">Loading…</div>;
  }

  const pendingNgos = users.filter((u) => u.role === "ngo" && !u.isVerified);

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <h1 className="font-display text-2xl font-semibold mb-1">Admin dashboard</h1>
      <p className="text-basil-950/60 text-sm mb-6">Verify organizations, monitor the network, review activity.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Donors" value={analytics.usersByRole.donor || 0} />
        <StatCard label="NGOs / shelters" value={analytics.usersByRole.ngo || 0} />
        <StatCard label="Volunteers" value={analytics.usersByRole.volunteer || 0} />
        <StatCard label="Servings rescued" value={analytics.totalServingsRescued} accent="harvest" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Delivered" value={analytics.donationsByStatus.delivered || 0} accent="basil" />
        <StatCard label="Expiring within 3h" value={analytics.donationsExpiringWithin3Hours} accent="red" />
        <StatCard label="Avg. rating" value={analytics.platformAvgRating ?? "—"} accent="harvest" />
        <StatCard label="Feedback entries" value={analytics.totalFeedbackEntries} />
      </div>

      <div className="flex gap-2 mb-5">
        {["overview", "verification", "users", "donations"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
              tab === t ? "bg-basil-800 text-clay-50" : "bg-white text-basil-950/60 border border-basil-950/10"
            }`}
          >
            {t} {t === "verification" && pendingNgos.length > 0 ? `(${pendingNgos.length})` : ""}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="card p-6">
          <h2 className="font-display font-semibold mb-3">Donations by status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(analytics.donationsByStatus).map(([status, count]) => (
              <div key={status} className="rounded-lg bg-clay-100 px-3 py-2">
                <p className="text-xs uppercase text-basil-950/50 capitalize">{status.replace("_", " ")}</p>
                <p className="font-display text-xl font-semibold">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "verification" && (
        pendingNgos.length === 0 ? (
          <p className="text-sm text-basil-950/50 card p-6 text-center">No organizations awaiting verification.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {pendingNgos.map((u) => (
              <div key={u._id} className="card p-5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{u.organizationName || u.name}</p>
                  <p className="text-xs text-basil-950/50">{u.email} · {u.address}</p>
                </div>
                <button className="btn-primary text-sm" onClick={() => verify(u._id)}>
                  Verify
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === "users" && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-clay-100 text-left text-xs uppercase text-basil-950/50">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Trust</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-basil-950/8">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.organizationName || u.name}</p>
                    <p className="text-xs text-basil-950/50">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <TrustBadge score={u.trustScore} size={30} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.isActive ? "bg-basil-800/10 text-basil-800" : "bg-rescue-red/10 text-rescue-red"}`}>
                      {u.isActive ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.role !== "admin" && (
                      <button className="btn-secondary !px-3 !py-1 text-xs" onClick={() => toggleActive(u)}>
                        {u.isActive ? "Deactivate" : "Reactivate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "donations" && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-clay-100 text-left text-xs uppercase text-basil-950/50">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">NGO</th>
                <th className="px-4 py-3">Volunteer</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {donations.map((d) => (
                <tr key={d._id} className="border-t border-basil-950/8">
                  <td className="px-4 py-3">{d.title}</td>
                  <td className="px-4 py-3">{d.donor?.organizationName || d.donor?.name}</td>
                  <td className="px-4 py-3">{d.requestedBy?.organizationName || d.requestedBy?.name || "—"}</td>
                  <td className="px-4 py-3">{d.volunteer?.name || "—"}</td>
                  <td className="px-4 py-3 capitalize">{d.status.replace("_", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
