import Cookies from "js-cookie";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const acceptMatchAPI = async (id) => {
  const token = Cookies.get("token");

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}matches/${id}/accept`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Accept failed");
  }

  return res.json();
};

export const useAcceptMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptMatchAPI,

    // 🔥 OPTIMISTIC UPDATE
    onMutate: async (matchId) => {
      await queryClient.cancelQueries({ queryKey: ["myMatches"] });

      const previousMatches = queryClient.getQueryData(["myMatches"]);

      queryClient.setQueryData(["myMatches"], (old) => {
        if (!old?.data) return old;

        return {
          ...old,
          data: old.data.map((m) =>
            m._id === matchId
              ? { ...m, status: "accepted", canClaim: true }
              : m
          ),
        };
      });

      return { previousMatches };
    },

    onSuccess: () => {
      toast.success("Match accepted!");
    },

    // rollback on error
    onError: (err, _matchId, context) => {
      queryClient.setQueryData(["myMatches"], context?.previousMatches);
      toast.error(err?.message || "Failed to accept match");
    },

    // sync with server
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["myMatches"] });
    },
  });
};