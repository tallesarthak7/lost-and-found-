import Cookies from "js-cookie";
import { useMutation } from "@tanstack/react-query";

import { getApiUrl } from "../lib/utils.js";

// Simulated function to post data to an API endpoint
const loginUser = async (user) => {
  const url = getApiUrl("login");
  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
  } catch (err) {
    throw new Error(
      `Cannot connect to backend server at ${url}. Check your network and verify VITE_API_URL in Vercel settings.`
    );
  }

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || result?.reason || "Please check your credentials and try again.");
  }
  return result;
};

// Custom hook for posting todos
export function useLogin() {
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
     // This callback is triggered if the mutation is successful
      Cookies.set("token", response.data.accessToken, { expires: 1 });
      Cookies.set("user",
          JSON.stringify({
          firstname: response.data.firstname,
          lastname: response.data.lastname,
          email: response.data.email,
          role: response.data.role,
        }),
        { expires: 1 }
      )
    },
    onError: (error) => {
      // Handle error case
      console.error("Error authenticating:", error);
    },
  });
}