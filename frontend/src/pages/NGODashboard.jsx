import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import DonationCard from "../components/DonationCard.jsx";
import StatCard from "../components/StatCard.jsx";

export default function NGODashboard() {
  const { user } = useAuth();
  const [available, setAvailable] = useState([]);
  const [mine, setMine] = useState([]);
  const [tab, setTab] = useState("discover");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const [a, m] = await Promise.all([
      api.get("/donations", { params: { status: "available" } }),
      api.get("/requests/mine"),
    ]);
    setAvailable(a.data.donations);
    setMine(m.data.donations);
  };

  useEffect(() => {
    load();
  }, []);

  const request = async (id) => {
    setBusyId(id);
    try {
      await api.post(`/requests/${id}/request`);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't request this donation.");
    } finally {
      setBusyId(null);
    }
  };

  const cancelRequest = async (id) => {
    await api.patch(`/requests/${id}/cancel-request`);
    await load();
  };

  if (!user.isVerified) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold mb-2">Verification pending</h1>
        <p className="text-basil-950/60 text-sm">
          An admin needs to verify {user.organizationName || "your organization"} before you can
          request donations. This usually happens quickly — check back soon.
        </p>
      </div>
    );
  }

  const delivered = mine.filter((d) => d.status === "delivered");

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <h1 className="font-display text-2xl font-semibold mb-1">
        {user.organizationName || "NGO"} dashboard
      </h1>
      <p className="text-basil-950/60 text-sm mb-6">Find surplus food near you and track requests.</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Available nearby" value={available.length} />
        <StatCard label="Active requests" value={mine.filter((d) => !["delivered", "cancelled", "expired"].includes(d.status)).length} accent="harvest" />
        <StatCard label="Delivered" value={delivered.length} accent="basil" />
      </div>

      <div className="flex gap-2 mb-5">
        {["discover", "my requests"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${
              tab === t ? "bg-basil-800 text-clay-50" : "bg-white text-basil-950/60 border border-basil-950/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "discover" ? (
        available.length === 0 ? (
          <p className="text-sm text-basil-950/50 card p-6 text-center">
            No available donations right now. Check back soon.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {available.map((d) => (
              <DonationCard
                key={d._id}
                donation={d}
                footer={
                  <button
                    className="btn-primary w-full text-sm"
                    disabled={busyId === d._id}
                    onClick={() => request(d._id)}
                  >
                    {busyId === d._id ? "Requesting…" : "Request this donation"}
                  </button>
                }
              />
            ))}
          </div>
        )
      ) : mine.length === 0 ? (
        <p className="text-sm text-basil-950/50 card p-6 text-center">You haven't requested any donations yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mine.map((d) => (
            <DonationCard
              key={d._id}
              donation={d}
              footer={
                d.status === "requested" ? (
                  <button className="btn-secondary w-full text-sm" onClick={() => cancelRequest(d._id)}>
                    Cancel request
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
