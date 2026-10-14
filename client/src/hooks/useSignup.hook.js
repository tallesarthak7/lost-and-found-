import { useMutation } from "@tanstack/react-query";

import { getApiUrl } from "../lib/utils.js";

// Simulated function to post data to an API endpoint
const createUser = async (user) => {
    const url = getApiUrl("users/create");
    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user),
        });
    } catch (err) {
        throw new Error(`Cannot connect to backend server at ${url}. Check your network and verify VITE_API_URL in Vercel settings.`);
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.message || data?.reason || 'Failed to create user');
    }
    return data;
};

export function useSignup() {
   return useMutation({
        mutationFn: createUser,
         onSuccess: (response) => {
            // This callback is triggered if the mutation is successful
            console.log("User Created Successfully", response);
            },
            onError: (error) => {
            // Handle error case
            console.error("Error creating user:", error);
            },
    });
}