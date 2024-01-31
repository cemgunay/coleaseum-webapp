import useOtherUser from "@/hooks/useOtherUser";
import { format } from "date-fns";
import { useMemo, useState } from "react";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import Avatar from "./Avatar";
import { IoTrash } from "react-icons/io5";
import ConfirmDeleteDialog from "./ConfirmDeleteDialog";
import { useToast } from "./ui/use-toast";
import { useRouter } from "next/router";
import useConversation from "@/hooks/useConversation";
import AvatarGroup from "./AvatarGroup";

const MessageProfileDrawer = ({
    data,
    isOpen,
    onClose,
    setIsDeleting,
    host,
}) => {
    const { toast } = useToast();
    const router = useRouter();
    const { conversationId } = useConversation();

    const [confirmOpen, setConfirmOpen] = useState(false);

    const { otherUser, isLoading } = useOtherUser(data);

    const statusText = useMemo(() => {
        if (data.isGroup) {
            return `${data.users.length} members`;
        }

        return null;
    }, [data]);

    const joinedDate = useMemo(() => {
        return format(new Date(otherUser.createdAt), "PP");
    }, [otherUser.createdAt]);

    const title = useMemo(() => {
        return data.name || otherUser.firstName;
    }, [data.name, otherUser.firstName]);

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        onClose();

        try {
            const response = await fetch(
                `/api/conversations/${conversationId}/delete`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            onClose();

            if (host) {
                router.push("/host/inbox").then(setIsDeleting(false));
            } else {
                router.push("/inbox").then(setIsDeleting(false));
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Failed to delete conversation :(",
                description: error.message,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <ConfirmDeleteDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmOpen(false)}
            />
            <Sheet open={isOpen} onOpenChange={onClose}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>
                            <div className="flex flex-col items-center mt-8">
                                <div className="mb-2">
                                    {data.isGroup ? (
                                        <AvatarGroup users={data.users} />
                                    ) : (
                                        <Avatar user={otherUser} />
                                    )}
                                </div>
                                <div>{title}</div>
                                <div className="text-sm text-gray-500">
                                    {statusText}
                                </div>
                                <div className="flex gap-10 my-8">
                                    <div
                                        onClick={() => setConfirmOpen(true)}
                                        className="flex flex-col gap-3 items-center cursor-pointer hover:opacity-75"
                                    >
                                        <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                                            <IoTrash size={20} />
                                        </div>
                                        <div className="text-sm font-light text-neutral-600">
                                            Delete
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SheetTitle>
                        <dl className="flex flex-col gap-4 items-start text-left">
                            {data.isGroup && (
                                <div>
                                    <dt
                                        className="
                                  text-sm 
                                  font-medium 
                                  text-gray-500
                                "
                                    >
                                        Emails
                                    </dt>
                                    <dd
                                        className="
                                  mt-1 
                                  text-sm 
                                  text-gray-900 
                                "
                                    >
                                        {data.users
                                            .map((user) => user.email)
                                            .join(", ")}
                                    </dd>
                                </div>
                            )}
                            {!data.isGroup && (
                                <div>
                                    <dt
                                        className="
                                  text-sm 
                                  font-medium 
                                  text-gray-500 
                                "
                                    >
                                        Email
                                    </dt>
                                    <dd
                                        className="
                                  mt-1 
                                  text-sm 
                                  text-gray-900 
                                "
                                    >
                                        {otherUser.email}
                                    </dd>
                                </div>
                            )}
                            {!data.isGroup && (
                                <>
                                    <hr className="w-full" />
                                    <div>
                                        <dt
                                            className="
                                    text-sm 
                                    font-medium 
                                    text-gray-500 
                                  "
                                        >
                                            Joined
                                        </dt>
                                        <dd
                                            className="
                                    mt-1 
                                    text-sm 
                                    text-gray-900 
                                  "
                                        >
                                            <time dateTime={joinedDate}>
                                                {joinedDate}
                                            </time>
                                        </dd>
                                    </div>
                                </>
                            )}
                        </dl>
                    </SheetHeader>
                </SheetContent>
            </Sheet>
        </>
    );
};

export default MessageProfileDrawer;
