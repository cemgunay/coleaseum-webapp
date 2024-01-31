import { HiPaperAirplane, HiPhoto } from "react-icons/hi2";
import { useForm } from "react-hook-form";
import { CldUploadButton } from "next-cloudinary";
import useConversation from "@/hooks/useConversation";
import MessageInput from "./MessageInput";

const MessageForm = () => {
    const { conversationId } = useConversation();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        defaultValues: {
            message: "",
        },
    });

    //submit a new message
    const onSubmit = async (data) => {
        setValue("message", "", { shouldValidate: true });

        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    conversationId: conversationId,
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            // Handle the response if needed
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    //submit image upload
    const handleUpload = async (result) => {
        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    image: result.info.secure_url,
                    conversationId: conversationId,
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            // Handle the response if needed
        } catch (error) {
            console.error("Failed to upload image:", error);
        }
    };

    return (
        <div
            className="
        py-4 
        px-4 
        bg-white 
        border-t 
        flex 
        items-center 
        gap-2
        w-full
      "
        >
            <CldUploadButton
                options={{ maxFiles: 1 }}
                onUpload={handleUpload}
                uploadPreset="coleaseum_messages"
            >
                <HiPhoto size={30} className="text-sky-500" />
            </CldUploadButton>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex items-center gap-2 lg:gap-4 w-full"
            >
                <MessageInput
                    id="message"
                    register={register}
                    errors={errors}
                    required
                    placeholder="Write a message"
                />
                <button
                    type="submit"
                    className="
            rounded-full 
            p-2 
            bg-sky-500 
            cursor-pointer 
            hover:bg-sky-600 
            transition
          "
                >
                    <HiPaperAirplane size={18} className="text-white" />
                </button>
            </form>
        </div>
    );
};

export default MessageForm;
