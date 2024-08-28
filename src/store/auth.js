import { create } from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";

const useAuthStore = create((set, get) => ({
    allUserData: null,
    loading: false,

    user: () => ({
      user_id: get().allUserData?.user_id || null,
      username: get().allUserData?.username || null,
    }),

    setUser: (user) =>
      set({
        allUserData: user,
      }),

    setLoading: (loading) => set({ loading }),

    isLoggedIn: () => get().allUserData !== null,
}));


if (import.meta.env.DEV) {  // if the environment is in development mode
  mountStoreDevtool("Store", useAuthStore); //  view and interact with the Zustand store's state in your browser's devtools, making it easier to debug and observe how the state changes during development.
}

export { useAuthStore };
