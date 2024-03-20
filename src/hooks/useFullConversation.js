import fetcher from "@/utils/fetcher";
import useSWR from "swr";

//function to get populated conversation data (otherwise save memory)
export const useConversationData = (conversationId) => {
    const { data, error, mutate } = useSWR(
        conversationId
            ? `/api/conversations/conversation/${conversationId}`
            : null,
        fetcher
    );

    return {
        conversation: data,
        isLoading: !error && !data,
        isError: error,
        mutate,
    };
};
