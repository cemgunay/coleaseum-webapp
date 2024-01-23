import { useSession } from "next-auth/react";

export const useAuth = () => {
    const { data: session, status } = useSession();
    const user = session?.user; // Extract the user from the session

    return { user, status };
};
