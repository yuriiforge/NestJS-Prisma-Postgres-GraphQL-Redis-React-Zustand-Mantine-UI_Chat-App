import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type User } from '../gql/graphql';

interface UserState {
  user: Partial<User> | null;
  updateProfileImage: (image: string) => void;
  updateUsername: (name: string) => void;
  setUser: (user: User | null) => void;
}

export const useUserStore = create<UserState>()(
  persist<UserState>(
    (set, get) => ({
      user: null,

      updateProfileImage: (image: string) =>
        set({
          user: get().user ? { ...get().user, avatarUrl: image } : null,
        }),

      updateUsername: (name: string) =>
        set({
          user: get().user ? { ...get().user, fullname: name } : null,
        }),

      setUser: (user) => set({ user }),
    }),
    {
      name: 'user-store',
    }
  )
);
