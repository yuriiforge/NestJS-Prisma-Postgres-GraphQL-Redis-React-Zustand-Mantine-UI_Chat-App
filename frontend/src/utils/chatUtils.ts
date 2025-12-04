import type { User } from '../gql/graphql';

/**
 * Checks if the current logged-in user is a member of the provided list of chat users.
 */
export const checkUserMembership = (
  chatMembers: Partial<User>[] | undefined | null,
  currentUserId: number | undefined
): boolean => {
  if (!chatMembers || !currentUserId) {
    return false;
  }

  return chatMembers.some((member) => member.id === currentUserId);
};
