import clsx from "clsx";
import { format } from "date-fns";

import Avatar from "./Avatar";
import useUser from "@/hooks/useUser";
import Image from "next/image";
import Skeleton from "./Skeleton";
import { useState } from "react";
import MessageImageModal from "./MessageImageModal";

const MessageBox = ({
    data,
    user,
    isLast,
    nextMessageSenderEmail,
    showTimestamp,
    lastSeenUserMessage,
}) => {
    //state variables
    const [imageModalOpen, setImageModalOpen] = useState(false);

    //constants
    const isOwn = user?.email === data?.sender?.email;
    const isNextMessageOwn = user?.email === nextMessageSenderEmail;
    const showAvatarAndName = !isOwn && (isLast || isNextMessageOwn);
    const seenList = (data.seen || [])
        .filter((user) => user.email !== data?.sender?.email)
        .map((user) => user.firstName)
        .join(", ");
    // Check if the message is a system message
    const isSystemMessage = data.type === "system";

    //classes
    const container = clsx(
        "flex gap-3",
        isOwn && "justify-end",
        !showAvatarAndName && "ml-10 pb-2",
        showAvatarAndName && "mb-2",
        isLast && "mb-4"
    );
    const body = clsx("flex flex-col gap-2", isOwn && "items-end");
    const message = clsx(
        "text-sm w-fit overflow-hidden",
        isOwn ? "bg-sky-500 text-white" : "bg-gray-100",
        data.image ? "rounded-md p-0" : "rounded-lg py-2 px-3"
    );
    const systemMessageClass = clsx(
        "text-center text-sm text-gray-500",
        "py-2 px-3",
        "w-full"
    );

    // Render different layout for system messages
    if (isSystemMessage) {
        return <div className={systemMessageClass}>{data.body}</div>;
    }

    return (
        <div className={container}>
            {showAvatarAndName && (
                <Avatar
                    user={data.sender}
                    className={"mt-auto h-7 w-7"}
                    placeholderHeight="h-7"
                    placeholderWidth="w-7"
                    placeholderIconSize="text-lg"
                />
            )}

            <div className={body}>
                {showTimestamp && (
                    <div className="flex items-center gap-1">
                        <div className="text-sm text-gray-500">
                            {data.sender.firstName}
                        </div>
                    </div>
                )}
                {showTimestamp && (
                    <div className="text-xs text-gray-400">
                        {format(new Date(data.createdAt), "p")}
                    </div>
                )}
                <div className={message}>
                    <MessageImageModal
                        src={data.image}
                        isOpen={imageModalOpen}
                        onClose={() => setImageModalOpen(false)}
                    />
                    {data.image ? (
                        <Image
                            alt="Image"
                            height="288"
                            width="288"
                            onClick={() => setImageModalOpen(true)}
                            src={data.image}
                            className="
                object-cover 
                cursor-pointer 
                hover:scale-110 
                transition 
                translate
              "
                        />
                    ) : (
                        <div>{data.body}</div>
                    )}
                </div>
                {lastSeenUserMessage && isOwn && seenList.length > 0 && (
                    <div className="text-xs font-light text-gray-500">
                        {`Seen by ${seenList}`}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageBox;
