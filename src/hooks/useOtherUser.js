import { useMemo } from "react";
import useUser from "./useUser";
import { useAuth } from "./useAuth";

//hook to get the other users information that is in chat
const useOtherUser = (conversation) => {
    const { user: currentUser } = useAuth();
    const currentUserEmail = currentUser?.email;

    const otherUserEmail = useMemo(() => {
        // Filter out the current user and then take the first user
        const otherUsers = conversation.users.filter(
            (user) => user.email !== currentUserEmail
        );
        return otherUsers[0]?.email; // Get the email of the first other user
    }, [currentUserEmail, conversation.users]);

    // Use useUser to fetch and process the other user's data
    const { user: otherUser, isLoading, error } = useUser(null, otherUserEmail);

    return { otherUser, isLoading, error };
};

export default useOtherUser;
