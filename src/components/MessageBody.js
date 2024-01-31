import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import useConversation from "@/hooks/useConversation";
import { find, last } from "lodash";
import MessageBox from "./MessageBox";
import { useAuth } from "@/hooks/useAuth";
import { CircularProgress } from "@mui/material";
import useUser from "@/hooks/useUser";
import { usePusher } from "@/hooks/usePusher";

//group messages into 5 minute chunks to make UI look cleaner
const groupMessagesByTime = (messages) => {
    const groupedMessages = [];
    let group = [];

    messages.forEach((message, index) => {
        if (index === 0) {
            group.push(message);
        } else {
            const previousMessage = messages[index - 1];
            const previousTimestamp = new Date(previousMessage.createdAt);
            const currentTimestamp = new Date(message.createdAt);

            // Check if the current message is within 5 minutes of the previous message
            if ((currentTimestamp - previousTimestamp) / 1000 / 60 <= 5) {
                group.push(message);
            } else {
                groupedMessages.push(group);
                group = [message];
            }
        }
    });

    if (group.length > 0) {
        groupedMessages.push(group);
    }

    return groupedMessages;
};

const MessageBody = ({ initialMessages = [] }) => {
    const bottomRef = useRef(null);

    //set initial state of messages
    const [messages, setMessages] = useState(
        groupMessagesByTime(initialMessages)
    );

    //For when SWR revalidates and updates the cached data
    useEffect(() => {
        setMessages(groupMessagesByTime(initialMessages));
    }, [initialMessages]);

    //scroll to bottom on load
    const scroll = useCallback((node) => {
        if (node !== null) {
            node.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, []);

    //scroll to bottom after messages
    useEffect(() => {
        // Ensure messages are loaded and bottomRef is current
        if (messages?.length > 0 && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, bottomRef.current]);

    const pusher = usePusher();

    // we will use this ID to fetch the rest of their info from the db
    const { user: contextUser, status } = useAuth();

    // user object from db
    const { user, isLoading, error } = useUser(contextUser?.id, null);

    //to get last seen message
    const lastSeenUserMessageId = useMemo(() => {
        // Flatten the grouped messages to a single array
        const flatMessages = messages.flat();

        // Find the last message sent by the user that has been seen by others
        const lastSeenUserMessage = flatMessages
            .slice()
            .reverse() // Reverse to start from the latest message
            .find(
                (msg) =>
                    user?.email === msg.sender?.email && // Check if the message is sent by the user
                    msg.seenIds &&
                    msg.seenIds.length > 1 // Check if the message has been seen by others
            );

        return lastSeenUserMessage?._id;
    }, [user, messages]); // Dependencies are 'user' and 'messages'

    //get conversationId from parameters
    const { conversationId } = useConversation();

    //function to mark messages as seen
    const markAsSeen = async () => {
        try {
            const response = await fetch(
                `/api/conversations/${conversationId}/seen`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            // Handle the response if needed
        } catch (error) {
            console.error("Failed to update seen status:", error);
        }
    };

    //useEffect to mark everything once you enter the conversation as seen
    useEffect(() => {
        if (conversationId) {
            markAsSeen();
        }
    }, [conversationId]);

    //useEffect for updating state from pusher events
    useEffect(() => {
        pusher.subscribe(conversationId);
        bottomRef?.current?.scrollIntoView();

        //to handle new message
        const messageHandler = (message) => {
            //mark as seen
            if (conversationId) {
                markAsSeen();
            }

            //update messages and then run them through the groupMessagesByTime
            setMessages((currentMessages) => {
                const updatedMessages = find(currentMessages.flat(), {
                    _id: message._id,
                })
                    ? currentMessages
                    : [...currentMessages.flat(), message];
                return groupMessagesByTime(updatedMessages);
            });

            bottomRef?.current?.scrollIntoView();
        };

        //update with seen if a user sees a message in real time
        const updateMessageHandler = (updatedMessage) => {
            setMessages((currentMessages) => {
                const flatMessages = currentMessages.flat().map((message) => {
                    return message._id === updatedMessage._id
                        ? updatedMessage
                        : message;
                });

                return groupMessagesByTime(flatMessages);
            });
        };

        pusher.bind("messages:new", messageHandler);
        pusher.bind("message:update", updateMessageHandler);

        return () => {
            pusher.unsubscribe(conversationId);
            pusher.unbind("messages:new", messageHandler);
            pusher.unbind("message:update", updateMessageHandler);
        };
    }, [conversationId]);

    const Loading = () => {
        return (
            <div className="fixed  top-1/2 left-1/2 text-color-primary">
                <CircularProgress size={24} color="inherit" />
            </div>
        );
    };

    if (status === "loading" || isLoading) {
        return <Loading />;
    }

    return (
        <div className="flex-1 overflow-y-auto mx-4 mt-4">
            {messages.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-1">
                    {group.map((message, messageIndex) => {
                        const nextMessageSenderEmail =
                            group[messageIndex + 1]?.sender?.email;

                        return (
                            <MessageBox
                                key={message._id}
                                data={message}
                                user={user}
                                isLast={messageIndex === group.length - 1}
                                nextMessageSenderEmail={nextMessageSenderEmail}
                                showTimestamp={messageIndex === 0}
                                lastSeenUserMessage={
                                    message._id === lastSeenUserMessageId
                                }
                            />
                        );
                    })}
                </div>
            ))}
            <div ref={scroll} />
            <div ref={bottomRef} />
        </div>
    );
};

export default MessageBody;
