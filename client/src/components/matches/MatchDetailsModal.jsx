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
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-red-600 text-sm">
              🎒 Lost Item Report
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700 uppercase">
              Lost
            </span>
          </div>
          <p className="text-gray-800 font-semibold text-base">
            {match.lostItemId?.title ?? "Unknown Item"}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            📍 <span className="font-medium">Location:</span> {match.lostItemId?.location || "No location provided"}
          </p>
          <p className="text-xs text-gray-600">
            🏷 <span className="font-medium">Category:</span> {match.lostItemId?.category || "General"}
          </p>
          {match.lostItemId?.description && (
            <p className="text-xs text-gray-500 mt-1.5 italic bg-white/70 p-2 rounded-lg border border-red-100">
              "{match.lostItemId.description}"
            </p>
          )}

          {/* Owner details if available */}
          {match.lostItemId?.postedBy && (
            <div className="mt-3 pt-3 border-t border-red-200/60 text-xs">
              <p className="font-semibold text-red-700 mb-1">
                👤 Reported Lost by:
              </p>
              <div className="bg-white/80 p-2.5 rounded-lg border border-red-100 space-y-1">
                <p className="text-gray-800 font-medium">
                  {match.lostItemId.postedBy.firstname} {match.lostItemId.postedBy.lastname || ""}
                </p>
                {match.lostItemId.postedBy.email && (
                  <p className="text-gray-600">
                    ✉️ <a href={`mailto:${match.lostItemId.postedBy.email}`} className="text-indigo-600 hover:underline">{match.lostItemId.postedBy.email}</a>
                  </p>
                )}
                {match.lostItemId.postedBy.phone && (
                  <p className="text-gray-600">
                    📞 <a href={`tel:${match.lostItemId.postedBy.phone}`} className="text-indigo-600 hover:underline">{match.lostItemId.postedBy.phone}</a>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FOUND ITEM & FINDER DETAILS */}
        <div className="mb-4 p-4 rounded-xl bg-green-50/50 border border-green-200">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-green-700 text-sm">
              📦 Found Item Report
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-800 uppercase">
              Found
            </span>
          </div>
          <p className="text-gray-800 font-semibold text-base">
            {match.foundItemId?.title ?? "Unknown Item"}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            📍 <span className="font-medium">Found At:</span> {match.foundItemId?.location || "No location provided"}
          </p>
          <p className="text-xs text-gray-600">
            🏷 <span className="font-medium">Category:</span> {match.foundItemId?.category || "General"}
          </p>
          {match.foundItemId?.description && (
            <p className="text-xs text-gray-500 mt-1.5 italic bg-white/70 p-2 rounded-lg border border-green-200">
              "{match.foundItemId.description}"
            </p>
          )}

          {/* FINDER CONTACT CARD (Highlighted) */}
          <div className="mt-3 pt-3 border-t border-green-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-green-800 uppercase tracking-wide flex items-center gap-1">
                <span>👤</span> Details of User Who Found Item:
              </p>
              <span className="text-[10px] bg-green-200 text-green-800 px-2 py-0.5 rounded font-medium">
                Finder Contact
              </span>
            </div>

            {match.foundItemId?.postedBy ? (
              <div className="bg-white p-3 rounded-xl border border-green-200 shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Name:</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {match.foundItemId.postedBy.firstname} {match.foundItemId.postedBy.lastname || ""}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Email:</span>
                  <a
                    href={`mailto:${match.foundItemId.postedBy.email}`}
                    className="font-medium text-indigo-600 hover:underline"
                  >
                    {match.foundItemId.postedBy.email || "Not provided"}
                  </a>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500 font-medium">Phone Number:</span>
                  {match.foundItemId.postedBy.phone ? (
                    <a
                      href={`tel:${match.foundItemId.postedBy.phone}`}
                      className="font-medium text-indigo-600 hover:underline font-mono"
                    >
                      {match.foundItemId.postedBy.phone}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">Not provided</span>
                  )}
                </div>

                {/* Quick contact buttons */}
                <div className="pt-2 flex gap-2">
                  {match.foundItemId.postedBy.email && (
                    <a
                      href={`mailto:${match.foundItemId.postedBy.email}?subject=Regarding Found Item: ${encodeURIComponent(match.foundItemId.title || "")}`}
                      className="flex-1 text-center py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-lg text-xs transition border border-indigo-200"
                    >
                      ✉️ Email Finder
                    </a>
                  )}
                  {match.foundItemId.postedBy.phone && (
                    <a
                      href={`tel:${match.foundItemId.postedBy.phone}`}
                      className="flex-1 text-center py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-lg text-xs transition border border-green-200"
                    >
                      📞 Call Finder
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white/80 p-3 rounded-xl border border-green-100 text-xs text-gray-500 italic">
                Finder user information is not available for this report.
              </div>
            )}
          </div>
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