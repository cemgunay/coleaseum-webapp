import { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import clsx from "clsx";
import useOtherUser from "@/hooks/useOtherUser";
import { useAuth } from "@/hooks/useAuth";
import Skeleton from "./Skeleton";
import Avatar from "./Avatar";
import AvatarGroup from "./AvatarGroup";

const ConversationBox = ({ data, selected, host }) => {
    const { otherUser, isLoading } = useOtherUser(data);
    const { user } = useAuth();
    const router = useRouter();

    //navigate user to conversation
    const handleClick = useCallback(() => {
        if (host) {
            router.push(`/host/inbox/conversations/${data._id}`);
        } else {
            router.push(`/inbox/conversations/${data._id}`);
        }
    }, [data, router]);

    //display last message in convo
    const lastMessage = useMemo(() => {
        const messages = data.messages || [];
        return messages[messages.length - 1];
    }, [data.messages]);

    const userId = useMemo(() => user?.id, [user]);

    const hasSeen = useMemo(() => {
        if (!lastMessage) {
            return false;
        }

        const seenArray = lastMessage.seen || [];

        if (!userId) {
            return false;
        }

        return seenArray.filter((user) => user === userId).length !== 0;
    }, [userId, lastMessage]);

    const lastMessageText = useMemo(() => {
        if (lastMessage?.image) {
            return "Sent an image";
        }

        if (lastMessage?.body) {
            return lastMessage?.body;
        }

        return "Started a conversation";
    }, [lastMessage]);

    const Loading = () => {
        return (
            <div>
                <Skeleton className={"w-full h-16 mb-3"} />
            </div>
        );
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div
            onClick={handleClick}
            className={clsx(
                `
        w-full 
        relative 
        flex 
        items-center 
        space-x-3 
        p-3 
        hover:bg-neutral-100
        rounded-lg
        transition
        cursor-pointer
        `,
                selected ? "bg-neutral-100" : "bg-white"
            )}
        >
            {data.isGroup ? (
                <AvatarGroup users={data.users} />
            ) : (
                <Avatar user={otherUser} />
            )}

            <div className="min-w-0 flex-1">
                <div className="focus:outline-none">
                    <span className="absolute inset-0" aria-hidden="true" />
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-md font-medium text-gray-900">
                            {data.name || otherUser.firstName}
                        </p>
                        {lastMessage?.createdAt && (
                            <p
                                className="
                  text-xs 
                  text-gray-400 
                  font-light
                "
                            >
                                {format(new Date(lastMessage.createdAt), "p")}
                            </p>
                        )}
                    </div>
                    <p
                        className={clsx(
                            `
              truncate 
              text-sm
              `,
                            hasSeen ? "text-gray-500" : "text-black font-medium"
                        )}
                    >
                        {lastMessageText}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConversationBox;
