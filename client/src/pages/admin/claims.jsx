import React from "react";
import AdminSidebar from "../../components/sidebar/adminsidebar";
import AdminNavbar from "../../components/navbar/Adminnavbar.jsx";
import { useGetClaims } from "../../hooks/adminHook/useFetchClaims.hook";
import { useApproveClaim } from "../../hooks/claimsHook/useApproveClaim.hook";
import { useRejectClaim } from "../../hooks/claimsHook/useRejectClaim.hook";

import { toast, Toaster } from "sonner";

const ClaimsPage = () => {
  const { data, isLoading, error } = useGetClaims();

  const { mutate: approveClaim, isPending: isApproving } = useApproveClaim();
  const { mutate: rejectClaim, isPending: isRejecting } = useRejectClaim();

  const [selectedClaim, setSelectedClaim] = React.useState(null);

const [actionType, setActionType] = React.useState(null);

const [reviewNote, setReviewNote] = React.useState("");

  const claims = data?.data || [];

  if (isLoading) {
    return <p className="p-6">Loading claims...</p>;
  }

  if (error) {
    return (
      <p className="p-6 text-red-500">
        {error.message}
      </p>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      {/* Navbar */}
      <AdminNavbar />

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main */}
      <main className="flex-1 p-6">

        <h1 className="text-3xl font-bold text-gray-700 mb-6">
          📦 Claims Management
        </h1>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">

          <div className="bg-white/80 p-5 rounded-2xl shadow text-center">
            <h2 className="text-3xl font-bold text-yellow-500">
              {
                claims.filter(
                  (c) => c.status === "pending"
                ).length
              }
            </h2>

            <p className="text-gray-500 mt-2">
              Pending Claims
            </p>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl shadow text-center">
            <h2 className="text-3xl font-bold text-green-500">
              {
                claims.filter(
                  (c) => c.status === "approved"
                ).length
              }
            </h2>

            <p className="text-gray-500 mt-2">
              Approved Claims
            </p>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl shadow text-center">
            <h2 className="text-3xl font-bold text-red-500">
              {
                claims.filter(
                  (c) => c.status === "rejected"
                ).length
              }
            </h2>

            <p className="text-gray-500 mt-2">
              Rejected Claims
            </p>
          </div>

          <div className="bg-white/80 p-5 rounded-2xl shadow text-center">
            <h2 className="text-3xl font-bold text-indigo-500">
              {claims.length}
            </h2>

            <p className="text-gray-500 mt-2">
              Total Claims
            </p>
          </div>

        </div>

        {/* Claim Cards */}
        <div className="space-y-6">

          {claims.map((claim) => (

            <div
              key={claim._id}
              className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow"
            >

              <div className="flex flex-col lg:flex-row justify-between gap-6">

                {/* Left */}
                <div className="flex gap-5">

                  <div className="w-28 h-28 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-4xl shadow">
                    📦
                  </div>

                  <div>

                    <h2 className="text-xl font-bold text-gray-700">
                      {claim.itemId?.title || "Unknown Item"}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      Claimed by:
                      {" "}
                      {claim.claimedBy?.firstname}
                      {" "}
                      {claim.claimedBy?.lastname}
                    </p>

                    <p className="text-gray-500">
                      Contact:
                      {" "}
                      {claim.contactInfo}
                    </p>

                    <p className="text-gray-500">
                      Message:
                      {" "}
                      {claim.message}
                    </p>

                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-400">Status:</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${
                        claim.status === "approved"
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : claim.status === "rejected"
                          ? "bg-red-100 text-red-700 border border-red-300"
                          : "bg-yellow-100 text-yellow-700 border border-yellow-300"
                      }`}>
                        {claim.status}
                      </span>
                    </div>

                    {claim.reviewNote && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        Note: {claim.reviewNote}
                      </p>
                    )}

                  </div>

                </div>

                {/* Actions */}
                <div className="flex gap-3 items-center">

                  {claim.status === "pending" ? (
                    <>
                      <button
                        onClick={() => {
                          setSelectedClaim(claim);
                          setActionType("approve");
                        }}
                        className="px-5 py-2 bg-green-500 hover:bg-green-600 transition text-white font-medium rounded-xl shadow-sm"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => {
                          setSelectedClaim(claim);
                          setActionType("reject");
                        }}
                        className="px-5 py-2 bg-red-500 hover:bg-red-600 transition text-white font-medium rounded-xl shadow-sm"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="text-xs font-medium text-gray-400 italic">
                      Reviewed
                    </span>
                  )}

                </div>

              </div>

            </div>

          ))}

        </div>
          {selectedClaim && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">

      <h2 className="text-xl font-bold mb-4">
        {actionType === "approve"
          ? "Approve Claim"
          : "Reject Claim"}
      </h2>

      <textarea
        value={reviewNote}
        onChange={(e) => setReviewNote(e.target.value)}
        placeholder="Enter review note (optional)..."
        className="w-full border rounded-xl p-3 h-32 outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <div className="flex justify-end gap-3 mt-5">

        <button
          onClick={() => {
            setSelectedClaim(null);
            setReviewNote("");
            setActionType(null);
          }}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 transition text-gray-700 rounded-xl"
        >
          Cancel
        </button>

        <button
          disabled={isApproving || isRejecting}
          onClick={() => {
            const currentClaim = selectedClaim;
            const note = reviewNote;

            if (actionType === "approve") {
              approveClaim(
                {
                  id: currentClaim._id,
                  reviewNote: note,
                },
                {
                  onSuccess: () => {
                    toast.success("Claim approved successfully!");
                  },
                  onError: (err) => {
                    toast.error(err?.message || "Failed to approve claim");
                  },
                }
              );
            } else {
              rejectClaim(
                {
                  id: currentClaim._id,
                  reviewNote: note,
                },
                {
                  onSuccess: () => {
                    toast.success("Claim rejected successfully!");
                  },
                  onError: (err) => {
                    toast.error(err?.message || "Failed to reject claim");
                  },
                }
              );
            }

            setSelectedClaim(null);
            setReviewNote("");
            setActionType(null);
          }}
          className={`px-4 py-2 text-white font-medium rounded-xl transition disabled:opacity-50 ${
            actionType === "approve"
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {isApproving || isRejecting ? "Processing..." : "Confirm"}
        </button>

      </div>

    </div>

  </div>
)}
      </main>
      <Toaster />
    </div>
  );
};

export default ClaimsPage;