import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { MdOutlineGroupAdd } from "react-icons/md";
import clsx from "clsx";
import { find } from "lodash";

import useConversation from "@/hooks/useConversation";
import ConversationBox from "./ConversationBox";
import GroupChatModal from "./GroupChatModal";
import { usePusher } from "@/hooks/usePusher";
import { useAuth } from "@/hooks/useAuth";

const ConversationList = ({ initialItems, users, host }) => {
    const { user } = useAuth();
    const [items, setItems] = useState(initialItems);

    //For when SWR revalidates and updates the cached data
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const pusher = usePusher();

    //the pusher key to subscribe to is the user id
    const pusherKey = useMemo(() => {
        return user?.id;
    }, [user?.id]);

    useEffect(() => {
        if (!pusherKey) {
            return;
        }

        pusher.subscribe(pusherKey);

        //when a new conversation is created
        const newHandler = (data) => {
            // Extract conversation and user role from the received data
            const { conversation, userRole } = data;

            // Check if the user's role aligns with the current view
            if (
                (host && userRole === "tenant") ||
                (!host && userRole === "subtenant")
            ) {
                setItems((current) => {
                    if (find(current, { _id: conversation._id })) {
                        return current;
                    }
                    return [conversation, ...current];
                });
            }
        };

        //when a conversation is updated from a new message being sent
        const updateHandler = (data) => {
            setItems((current) =>
                current.map((currentConversation) => {
                    if (currentConversation._id === data._id) {
                        return {
                            ...currentConversation,
                            messages: data.messages,
                        };
                    }
                    return currentConversation;
                })
            );
        };

        pusher.bind("conversation:new", newHandler);
        pusher.bind("conversation:update", updateHandler);

        return () => {
            pusher.unsubscribe(pusherKey);
            pusher.unbind("conversation:new", newHandler);
            pusher.unbind("conversation:update", updateHandler);
        };
    }, [pusherKey]);

    const { conversationId, isOpen } = useConversation();

    return (
        <>
            <GroupChatModal
                users={users}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                host={host}
            />
            <div
                className={clsx(
                    `
        fixed 
        inset-y-0 
        pb-20
        lg:pb-0
        lg:left-20 
        lg:w-80 
        lg:block
        overflow-y-auto 
        border-r 
        border-gray-200 
      `,
                    isOpen ? "hidden" : "block w-full left-0"
                )}
            >
                <div className="px-5">
                    <div className="flex justify-between mb-4 pt-4">
                        <div className="text-2xl font-bold text-neutral-800">
                            Messages
                        </div>
                        <div
                            onClick={() => setIsModalOpen(true)}
                            className="
                rounded-full 
                p-2 
                bg-gray-100 
                text-gray-600 
                cursor-pointer 
                hover:opacity-75 
                transition
              "
                        >
                            <MdOutlineGroupAdd size={20} />
                        </div>
                    </div>
                    {items?.length === 0 && <div>Looking empty here...</div>}
                    {items?.map((item) => (
                        <ConversationBox
                            key={item._id}
                            data={item}
                            selected={conversationId === item._id}
                            host={host}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default ConversationList;
