import useSWR from "swr";
import fetcher from "@/utils/fetcher";
import { useMemo } from "react";

function useUser(userId, status) {
    const { data, error, isLoading } = useSWR(
        () => (status === "authenticated" ? `/api/users/${userId}` : null),
        fetcher
    );

    // Create a derived state for the updated user
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
