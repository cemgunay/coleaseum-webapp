import ConversationList from "@/components/ConversationList";
import { useAuth } from "@/hooks/useAuth";
import React from "react";
import useSWR from "swr";
import fetcher from "@/utils/fetcher";
import { CircularProgress } from "@mui/material";
import BottomNav from "@/components/BottomNav";

const Index = () => {
    const { user, status } = useAuth();

    // Function to load conversation data from the database
    const {
        data: conversations,
        error: errorConversations,
        isLoading: isLoadingConversations,
    } = useSWR(
        status === "authenticated"
            ? `/api/conversations/user/subtenant/${user.id}`
            : null,
        fetcher,
        {
            revalidateOnMount: true,
        }
    );

    // Function to load user data from the database
    const {
        data: users,
        error: errorUsers,
        isLoading: isLoadingUsers,
    } = useSWR(
        status === "authenticated"
            ? `/api/users/all-users?userId=${user.id}`
            : null,
        fetcher,
        {
            revalidateOnMount: true,
        }
    );

    const Loading = () => {
        return (
            <div className="fixed top-1/2 left-1/2 text-color-primary">
                <CircularProgress size={24} color="inherit" />
            </div>
        );
    };

    if (
        status === "loading" ||
        isLoadingConversations ||
        isLoadingUsers ||
        errorConversations ||
        errorUsers
    ) {
        return <Loading />;
    }
    return (
        <div>
            <ConversationList initialItems={conversations} users={users} />
            <BottomNav />
        </div>
    );
};

export default Index;
