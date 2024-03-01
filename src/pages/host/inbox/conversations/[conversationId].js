import MessageBody from "@/components/MessageBody";
import MessageForm from "@/components/MessageForm";
import MessageHeader from "@/components/MessageHeader";
import fetcher from "@/utils/fetcher";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect } from "react";
import useSWR from "swr";

const Conversation = () => {
    const router = useRouter();
    const { conversationId } = router.query;

    // Function to load data from the database
    const {
        data: conversation,
        error: error1,
        isLoading: isLoadingConversation,
    } = useSWR(
        conversationId
            ? `/api/conversations/conversation/${conversationId}`
            : null,
        fetcher
    );

    //if user is not authorized redirect
    useEffect(() => {
        if (error1?.status === 403) {
            router.push("/403");
        }
    }, [error1, router]);

    // Function to load data from the database
    const {
        data: messages,
        error: error2,
        isLoading: isLoadingMessage,
        isValidating: isValidatingMessage
    } = useSWR(
        conversationId ? `/api/messages/${conversationId}` : null,
        fetcher
    );

    const Loading = () => {
        return (
            <div className="fixed top-1/2 left-1/2 text-color-primary">
                <CircularProgress size={24} color="inherit" />
            </div>
        );
    };

    if (
        isLoadingConversation ||
        isLoadingMessage ||
        !conversationId ||
        error1
    ) {
        return <Loading />; // Or any other loading indicator
    }

    return (
        <div className="h-screen flex flex-col">
            <div className="sticky top-0 z-10">
                <MessageHeader initialConversation={conversation} host={true} />
            </div>
            <div className="flex-grow overflow-y-auto">
                <MessageBody initialMessages={messages} />
            </div>
            <div className="sticky bottom-0 z-10">
                <MessageForm />
            </div>
        </div>
    );
};

export default Conversation;
