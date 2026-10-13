import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import DonationCard from "../components/DonationCard.jsx";
import StatCard from "../components/StatCard.jsx";

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [openPickups, setOpenPickups] = useState([]);
  const [mine, setMine] = useState([]);
  const [tab, setTab] = useState("open pickups");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    const [o, m] = await Promise.all([
      api.get("/requests/open-pickups"),
      api.get("/requests/mine"),
    ]);
    setOpenPickups(o.data.donations);
    setMine(m.data.donations);
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (fn, id) => {
    setBusyId(id);
    try {
      await fn(id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  };

  const accept = (id) => act((id) => api.patch(`/requests/${id}/accept-pickup`), id);
  const markPickedUp = (id) => act((id) => api.patch(`/requests/${id}/mark-picked-up`), id);
  const markDelivered = (id) => act((id) => api.patch(`/requests/${id}/mark-delivered`), id);

  const activeMine = mine.filter((d) => ["assigned", "picked_up"].includes(d.status));
  const delivered = mine.filter((d) => d.status === "delivered");

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <h1 className="font-display text-2xl font-semibold mb-1">Volunteer dashboard</h1>
      <p className="text-basil-950/60 text-sm mb-6">Accept pickups and keep the chain moving.</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Open pickups" value={openPickups.length} />
        <StatCard label="In progress" value={activeMine.length} accent="harvest" />
        <StatCard label="Delivered" value={delivered.length} accent="basil" />
      </div>

      <div className="flex gap-2 mb-5">
        {["open pickups", "my pickups"].map((t) => (
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

      {tab === "open pickups" ? (
        openPickups.length === 0 ? (
          <p className="text-sm text-basil-950/50 card p-6 text-center">
            No pickups waiting for a volunteer right now.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {openPickups.map((d) => (
              <DonationCard
                key={d._id}
                donation={d}
                footer={
                  <button
                    className="btn-primary w-full text-sm"
                    disabled={busyId === d._id}
                    onClick={() => accept(d._id)}
                  >
                    {busyId === d._id ? "Accepting…" : "Accept pickup"}
                  </button>
                }
              />
            ))}
          </div>
        )
      ) : mine.length === 0 ? (
        <p className="text-sm text-basil-950/50 card p-6 text-center">You haven't accepted any pickups yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mine.map((d) => (
            <DonationCard
              key={d._id}
              donation={d}
              footer={
                d.status === "assigned" ? (
                  <button
                    className="btn-primary w-full text-sm"
                    disabled={busyId === d._id}
                    onClick={() => markPickedUp(d._id)}
                  >
                    {busyId === d._id ? "Updating…" : "Mark picked up"}
                  </button>
                ) : d.status === "picked_up" ? (
                  <button
                    className="btn-primary w-full text-sm"
                    disabled={busyId === d._id}
                    onClick={() => markDelivered(d._id)}
                  >
                    {busyId === d._id ? "Updating…" : "Mark delivered"}
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
