import { HiChevronLeft } from "react-icons/hi";
import { HiEllipsisHorizontal } from "react-icons/hi2";
import { useEffect, useState } from "react";
import Link from "next/link";
import useOtherUser from "@/hooks/useOtherUser";
import Avatar from "./Avatar";
import Skeleton from "./Skeleton";
import MessageProfileDrawer from "./MessageProfileDrawer";
import AvatarGroup from "./AvatarGroup";
import { MdOutlineGroupAdd } from "react-icons/md";
import AddMembers from "./AddMembers";
import useSWR from "swr";
import fetcher from "@/utils/fetcher";
import { useAuth } from "@/hooks/useAuth";
import useUser from "@/hooks/useUser";
import { usePusher } from "@/hooks/usePusher";
import { useConversationData } from "@/hooks/useFullConversation";
import FullScreenLoader from "./FullScreenLoading";

const MessageHeader = ({ initialConversation, host }) => {
    //get full conversation data with populated users
    const {
        conversation,
        isLoading: isLoadingConversation,
        isError,
        mutate,
    } = useConversationData(initialConversation._id);

    //get other user data information for picture and name
    const { otherUser, isLoading: isLoadingOtherUser } =
        useOtherUser(conversation);

    //state variables
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // we will use this ID to fetch the rest of their info from the db
    const { user: contextUser, status } = useAuth();

    // user object from db
    const { user, isLoadingUser, error } = useUser(contextUser?.id, null);

    const pusher = usePusher();

    //useEffect for running pusher updates
    useEffect(() => {
        if (!conversation) {
            return;
        }

        //subscribe to conversation channel and update information with swr mutate
        pusher.subscribe(conversation._id);

        const updateHandler = async (data) => {
            if (data.conversation._id === conversation._id) {
                // Call mutate to re-fetch the conversation data
                mutate();
            }
        };

        pusher.bind("conversation:update", updateHandler);

        return () => {
            pusher.unsubscribe(conversation._id);
            pusher.unbind("conversation:update", updateHandler);
        };
    }, [conversation._id]);

    // Convert conversation.userIds array into a comma-separated string
    const excludedUserIds = conversation?.userIds?.join(",");

    // Modify the useSWR hook to include the excludedUserIds in the query
    const {
        data: users,
        error: errorUsers,
        isLoading: isLoadingUsers,
    } = useSWR(
        status === "authenticated" && excludedUserIds
            ? `/api/users/all-users?userId=${excludedUserIds}`
            : null,
        fetcher
    );

    //loading state identical to actual component
    const Loading = () => {
        return (
            <div
                className="
  bg-white 
  w-full 
  flex 
  border-b-[1px] 
  py-3 
  px-4 
  justify-between 
  items-center 
  shadow-sm
"
            >
                <div className="flex gap-3 items-center">
                    <div
                        className="
      block 
      text-sky-500 
      hover:text-sky-600 
      transition 
      cursor-pointer
    "
                    >
                        <HiChevronLeft size={32} />
                    </div>

                    <Skeleton className={"w-10 h-10 rounded-full"} />

                    <div className="flex flex-col">
                        <Skeleton className={"w-4 h-4"} />
                    </div>
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
                <HiEllipsisHorizontal
                    size={32}
                    onClick={() => setDrawerOpen(true)}
                    className="
    text-sky-500
    cursor-pointer
    hover:text-sky-600
    transition
  "
                />
            </div>
        );
    };

    //all loading states
    if (
        isLoadingOtherUser ||
        isLoadingUsers ||
        isLoadingUser ||
        isLoadingConversation
    ) {
        return <Loading />;
    }

    return (
        <>
            {isDeleting && <FullScreenLoader />}
            <AddMembers
                users={users}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                conversationId={conversation._id}
                user={user}
            />
            <MessageProfileDrawer
                data={conversation}
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                setIsDeleting={setIsDeleting}
                host={host}
            />
            <div
                className="
          bg-white 
          w-full 
          flex 
          border-b-[1px] 
          py-3 
          px-4 
          justify-between 
          items-center 
          shadow-sm
        "
            >
                <div className="flex gap-3 items-center">
                    <Link
                        href={host ? "/host/inbox" : "/inbox"}
                        className="
        block 
        text-sky-500 
        hover:text-sky-600 
        transition 
        cursor-pointer
    "
                    >
                        <HiChevronLeft size={32} />
                    </Link>
                    {conversation.isGroup ? (
                        <AvatarGroup users={conversation.users} />
                    ) : (
                        <Avatar user={otherUser} />
                    )}

                    <div className="flex flex-col">
                        <div>{conversation.name || otherUser.firstName}</div>
                    </div>
                </div>
                <div className="flex justify-between gap-4">
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
                    <HiEllipsisHorizontal
                        size={32}
                        onClick={() => setDrawerOpen(true)}
                        className="
            text-sky-500
            cursor-pointer
            hover:text-sky-600
            transition
          "
                    />
                </div>
            </div>
        </>
    );
};

export default MessageHeader;
