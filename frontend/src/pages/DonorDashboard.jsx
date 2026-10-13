import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import DonationCard from "../components/DonationCard.jsx";
import StatCard from "../components/StatCard.jsx";
import TrustBadge from "../components/TrustBadge.jsx";

const emptyForm = {
  title: "",
  foodType: "veg",
  description: "",
  quantity: 10,
  unit: "servings",
  expiryTime: "",
  pickupAddress: "",
  safetyNotes: "",
};

export default function DonorDashboard() {
  const { user, setUser } = useAuth();
  const [donations, setDonations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    const { data } = await api.get("/requests/mine");
    setDonations(data.donations);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.post("/donations", form);
      setForm(emptyForm);
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't post this donation.");
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (id) => {
    await api.patch(`/donations/${id}/cancel`);
    await load();
  };

  const active = donations.filter((d) => !["delivered", "cancelled", "expired"].includes(d.status));
  const past = donations.filter((d) => ["delivered", "cancelled", "expired"].includes(d.status));

  return (
    <div className="max-w-5xl mx-auto px-5 py-8">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold">Donor dashboard</h1>
          <p className="text-basil-950/60 text-sm mt-1">
            Post surplus food and track it through to delivery.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 card px-3 py-2">
            <TrustBadge score={user.trustScore ?? 50} size={36} />
            <div className="text-xs text-basil-950/60 leading-tight">
              <div className="font-semibold text-basil-900">Trust score</div>
              <div>{user.stats?.successfulDonations ?? 0} completed donations</div>
            </div>
          </div>
          <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Close" : "+ Post surplus food"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <StatCard label="Active listings" value={active.length} />
        <StatCard label="Delivered" value={donations.filter((d) => d.status === "delivered").length} accent="basil" />
        <StatCard label="Cancelled" value={donations.filter((d) => d.status === "cancelled").length} accent="red" />
        <StatCard label="Trust score" value={user.trustScore ?? 50} accent="harvest" />
      </div>

      {showForm && (
        <form onSubmit={submit} className="card p-6 mb-8 grid sm:grid-cols-2 gap-4">
          {error && (
            <p className="sm:col-span-2 text-sm text-rescue-red bg-rescue-red/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="sm:col-span-2">
            <label className="label">What's the food?</label>
            <input
              required
              className="input"
              placeholder="e.g. Vegetable biryani, freshly cooked"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Food type</label>
            <select
              className="input"
              value={form.foodType}
              onChange={(e) => setForm({ ...form, foodType: e.target.value })}
            >
              <option value="veg">Vegetarian</option>
              <option value="non_veg">Non-vegetarian</option>
              <option value="mixed">Mixed</option>
              <option value="bakery">Bakery</option>
              <option value="packaged">Packaged</option>
              <option value="beverages">Beverages</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Quantity</label>
              <input
                type="number"
                min="1"
                required
                className="input"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Unit</label>
              <select
                className="input"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <option value="servings">Servings</option>
                <option value="kg">Kg</option>
                <option value="plates">Plates</option>
                <option value="packets">Packets</option>
                <option value="liters">Liters</option>
              </select>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea
              className="input"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Safe to eat until</label>
            <input
              type="datetime-local"
              required
              className="input"
              value={form.expiryTime}
              onChange={(e) => setForm({ ...form, expiryTime: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Pickup address</label>
            <input
              required
              className="input"
              value={form.pickupAddress}
              onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Safety notes (optional)</label>
            <input
              className="input"
              placeholder="e.g. Contains nuts, kept refrigerated"
              value={form.safetyNotes}
              onChange={(e) => setForm({ ...form, safetyNotes: e.target.value })}
            />
          </div>
          <button className="btn-primary sm:col-span-2" disabled={busy}>
            {busy ? "Posting…" : "Post donation"}
          </button>
        </form>
      )}

      <h2 className="font-display text-lg font-semibold mb-3">Active listings</h2>
      {active.length === 0 ? (
        <p className="text-sm text-basil-950/50 card p-6 text-center mb-8">
          Nothing posted right now. Surplus food waiting? Post it above.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {active.map((d) => (
            <DonationCard
              key={d._id}
              donation={d}
              footer={
                d.status === "available" ? (
                  <button className="btn-secondary w-full text-sm" onClick={() => cancel(d._id)}>
                    Cancel listing
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="font-display text-lg font-semibold mb-3">History</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {past.map((d) => (
              <DonationCard key={d._id} donation={d} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
