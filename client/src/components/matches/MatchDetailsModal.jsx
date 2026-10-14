import React from "react";

const MatchDetailsModal = ({ match, onClose, onClaim }) => {
  if (!match) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black p-1 rounded-full hover:bg-gray-100 transition"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-800">
          🔍 Match Details
        </h2>

        {/* MATCH SCORE */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Match Score</p>
          <p className="text-2xl font-bold text-indigo-600">
            {match.matchScore}%
          </p>
        </div>

        {/* REASON */}
        <div className="mb-4">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Why this match?</p>
          <p className="text-gray-700 text-sm mt-1 bg-gray-50 p-3 rounded-xl border border-gray-100">
            {match.matchReason || "The system identified matching keywords, category, and location between these reports."}
          </p>
        </div>

        <hr className="my-4 border-gray-100" />

        {/* LOST ITEM */}
        <div className="mb-4 p-4 rounded-xl bg-red-50/50 border border-red-100">
          <h3 className="font-semibold text-red-600 text-sm mb-1">
            🎒 Lost Item Report
          </h3>
          <p className="text-gray-800 font-medium">
            {match.lostItemId?.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            📍 {match.lostItemId?.location || "No location provided"}
          </p>
          <p className="text-xs text-gray-500">
            Category: {match.lostItemId?.category || "General"}
          </p>
        </div>

        {/* FOUND ITEM */}
        <div className="mb-4 p-4 rounded-xl bg-green-50/50 border border-green-100">
          <h3 className="font-semibold text-green-700 text-sm mb-1">
            📦 Found Item Report
          </h3>
          <p className="text-gray-800 font-medium">
            {match.foundItemId?.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            📍 {match.foundItemId?.location || "No location provided"}
          </p>
          <p className="text-xs text-gray-500">
            Category: {match.foundItemId?.category || "General"}
          </p>
        </div>

        <hr className="my-4 border-gray-100" />

        {/* STATUS & ACTIONS */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Status</p>
            <span className="font-semibold capitalize text-indigo-600 text-sm">
              {match.status}
            </span>
          </div>

          <div className="flex gap-2">
            {onClaim && !match.hasClaim && match.status !== "rejected" && (
              <button
                onClick={() => {
                  onClose();
                  onClaim(match);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition shadow-sm"
              >
                📦 Claim This Item
              </button>
            )}
            <button
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2 rounded-xl text-sm transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetailsModal;