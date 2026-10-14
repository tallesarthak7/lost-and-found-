import React, { useState } from "react";
import { useCreateClaim } from "../../hooks/claimsHook/useCreateClaim.hook";
import { toast } from "sonner";

const CreateClaimModal = ({ match, onClose }) => {
  const { mutate, isPending } = useCreateClaim();

  const [form, setForm] = useState({
    message: "",
    contactInfo: "",
    proofImages: [],
  });

  const [errorMessage, setErrorMessage] = useState("");

  if (!match) return null;

  // Resolve target item ID and match ID reliably
  const targetItemId =
    match.foundItemId?._id ||
    (typeof match.foundItemId === "string" ? match.foundItemId : null) ||
    match.lostItemId?._id ||
    (typeof match.lostItemId === "string" ? match.lostItemId : null) ||
    match.itemId?._id ||
    match.itemId ||
    match._id;

  const matchId =
    match.lostItemId && match.foundItemId ? match._id : (match.matchId || null);

  const displayTitle =
    match.lostItemId?.title ||
    match.foundItemId?.title ||
    match.title ||
    "Matched Item";

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.message.trim() || form.message.trim().length < 10) {
      setErrorMessage("Please enter a detailed message (at least 10 characters).");
      return;
    }

    if (!form.contactInfo.trim()) {
      setErrorMessage("Please provide your contact information.");
      return;
    }

    if (!targetItemId) {
      setErrorMessage("Unable to identify the item to claim. Please refresh and try again.");
      return;
    }

    mutate(
      {
        itemId: targetItemId,
        matchId: matchId || undefined,
        message: form.message.trim(),
        contactInfo: form.contactInfo.trim(),
        proofImages: form.proofImages,
      },
      {
        onSuccess: () => {
          toast.success("Claim submitted successfully! Awaiting review.");
          onClose();
        },
        onError: (err) => {
          const msg = err?.message || "Failed to submit claim. Please try again.";
          setErrorMessage(msg);
          toast.error(msg);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-lg p-1 rounded-full hover:bg-gray-100 transition"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-1 text-gray-800">
          📦 Submit Ownership Claim
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Provide proof and contact details so the finder/admin can verify and return the item.
        </p>

        {/* ITEM INFO */}
        <div className="mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-gray-700">
          <span className="text-gray-500">Claiming: </span>
          <span className="font-semibold text-indigo-700">{displayTitle}</span>
          {match.matchScore && (
            <span className="ml-2 text-xs bg-indigo-200 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
              Match Score: {match.matchScore}%
            </span>
          )}
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Description / Verification Proof *
            </label>
            <textarea
              placeholder="Describe unique details (e.g., serial number, distinctive marks, wallpapers, contents) to prove it's yours (min 10 characters)..."
              className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none min-h-[100px]"
              value={form.message}
              minLength={10}
              onChange={(e) => {
                setForm({ ...form, message: e.target.value });
                if (errorMessage) setErrorMessage("");
              }}
              required
            />
            <p className="text-[11px] text-gray-400 mt-1">
              {form.message.length}/10 characters minimum
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Contact Information (Phone / Student ID / Email) *
            </label>
            <input
              type="text"
              placeholder="e.g., +91 9876543210 or student@campus.edu"
              className="w-full border border-gray-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              value={form.contactInfo}
              onChange={(e) => {
                setForm({ ...form, contactInfo: e.target.value });
                if (errorMessage) setErrorMessage("");
              }}
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-50 shadow-md shadow-indigo-100"
            >
              {isPending ? "Submitting..." : "Submit Claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClaimModal;