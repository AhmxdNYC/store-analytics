"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OnboardingForm() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [locations, setLocations] = useState(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function updateLocation(index: number, value: string) {
    setLocations((prev) => prev.map((l, i) => (i === index ? value : l)));
  }

  function addLocation() {
    setLocations((prev) => [...prev, ""]);
  }

  function removeLocation(index: number) {
    setLocations((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const filledLocations = locations.filter((l) => l.trim().length > 0);
    if (filledLocations.length === 0) {
      setError("Add at least one location");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: orgName, locations: filledLocations }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json() as { error: string };
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business name
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Ahmad's Stores"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your locations
        </label>
        <div className="space-y-2">
          {locations.map((loc, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                placeholder={`e.g. ${i === 0 ? "Deli" : "Store 99"}`}
                value={loc}
                onChange={(e) => updateLocation(i, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {locations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLocation(i)}
                  className="px-3 py-2 text-gray-400 hover:text-red-500"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addLocation}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          + Add another location
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Setting up..." : "Create my workspace"}
      </button>
    </form>
  );
}
