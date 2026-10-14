import Cookies from "js-cookie";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const createClaim = async (payload) => {
  const token = Cookies.get("token");

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}claims`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message =
      err.error?.message ||
      (Array.isArray(err.error?.errors) && err.error.errors[0]?.msg) ||
      (Array.isArray(err.errors) && err.errors[0]?.msg) ||
      err.message ||
      "Failed to create claim";

    throw new Error(message);
  }

  return res.json();
};

export const useCreateClaim = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClaim,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["myClaims"],
      });

      queryClient.invalidateQueries({
        queryKey: ["myMatches"],
      });

      queryClient.invalidateQueries({
        queryKey: ["item"],
      });
    },
  });
};