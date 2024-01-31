import useSWR from "swr";
import fetcher from "@/utils/fetcher";
import { useMemo } from "react";
import { useAuth } from "./useAuth";

//function to get current users full details
function useUser(userId, email) {
    const { status } = useAuth();
    const shouldFetch = status === "authenticated" && (!!userId || !!email);

    const fetchUrl = userId
        ? `/api/users/${userId}`
        : `/api/users/email/${email}`;

    const { data, error, isLoading } = useSWR(
        shouldFetch ? fetchUrl : null,
        fetcher
    );

    // Derived state for the updated user
    const updatedUser = useMemo(() => {
        if (data && !data.firstName && !data.lastName && data.name) {
            const nameParts = data.name.split(" ");
            return {
                ...data,
                firstName: nameParts[0],
                lastName: nameParts.slice(1).join(" "),
            };
        }
        return data;
    }, [data]);

    return {
        user: updatedUser,
        isLoading,
        error,
    };
}

export default useUser;
