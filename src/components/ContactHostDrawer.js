import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import AuthTextArea from "./AuthTextArea";
import { useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

//Validation function for message input.
const validateMessage = (value, name) => {
    if (!value) {
        return null;
    } else if (value.length < 4) {
        return `${name} must be more than 4 characters`;
    }
    return null;
};

const ContactHostDrawer = ({
    isOpen,
    onClose,
    host,
    message,
    setMessage,
    listingId,
}) => {
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);

    //will track the number of message characters
    const [messageCount, setMessageCount] = useState(
        message ? message.length : 0
    );

    // State for handling form validation errors and touch status
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({
        message: false,
    });

    // Handler function for input blur event to trigger validation
    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });

        // Validate on blur
        setErrors({ ...errors, [name]: validate(name, value) });
    };

    // Function to choose the appropriate validation based on input name
    const validate = (name, value) => {
        switch (name) {
            case "message":
                return validateMessage(value, "Message");
            default:
                return null;
        }
    };

    //handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        const length = value.length;

        // Set touched state to true for the current field
        setTouched({ ...touched, [name]: true });

        // Perform validation and update errors
        const validationError = validate(name, value);
        setErrors({ ...errors, [name]: validationError });

        setMessage(value);
        setMessageCount(length);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsLoading(true);

        try {
            const hostUserId = host._id;

            // Step 1: Create a new conversation or get existing one
            const conversationResponse = await fetch("/api/conversations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: hostUserId,
                    isGroup: false,
                    members: [],
                    name: "",
                    listingId: listingId,
                }),
            });

            if (!conversationResponse.ok) {
                throw new Error("Failed to retrieve or create conversation");
            }

            const conversation = await conversationResponse.json();
            const conversationId = conversation._id;

            // Step 2: Send the message using the conversation ID
            const messageResponse = await fetch("/api/messages", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: message,
                    image: "",
                    conversationId: conversationId,
                }),
            });

            if (!messageResponse.ok) {
                throw new Error("Failed to send message");
            }

            // Success: Close the drawer and optionally update UI
            onClose();

            toast({
                variant: "success",
                title: "Message sent",
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="flex flex-col gap-4 w-3/4">
                <SheetHeader>
                    <SheetTitle>
                        <div className="mb-4 mt-8">Contact Host</div>
                    </SheetTitle>
                    <div className="flex flex-col justify-start items-start">
                        Write a message to {host?.firstName}
                    </div>
                    <div className="flex flex-col items-start">
                        <AuthTextArea
                            className="w-full"
                            classNameInput="h-32"
                            classNameError="ml-0"
                            maxLength={165}
                            name="description"
                            required
                            placeholder="I have a question about..."
                            value={message || ""}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.message}
                            touched={touched.message}
                        />
                        <div className="font-light text-xs">
                            {messageCount}/165
                        </div>
                    </div>
                </SheetHeader>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button onClick={handleSubmit}>Send</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
};

export default ContactHostDrawer;
