import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import Select from "./Select";
import sendSystemMessage from "@/utils/sendSystemMessage";

const AddMembers = ({ isOpen, onClose, users = [], conversationId, user }) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const {
        handleSubmit,
        control,
        formState: { errors },
        trigger,
    } = useForm({
        defaultValues: {
            name: "",
            members: [],
        },
    });

    //function to handle updaing conversation and adding members to the conversation
    const onSubmit = async (data) => {
        const isValid = await trigger("members");

        if (!isValid) {
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("/api/conversations", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    conversationId, // Include the conversationId
                    newMembers: data.members.map((member) => member.value), // Extract member IDs
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            // Call the function to send a system message
            await sendSystemMessage(
                conversationId,
                `${user.firstName} has added ${data.members.map(
                    (member) => member.label
                )}`
            );
            onClose();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Unable to create group chat.",
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add members to chat</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-4 border-b border-gray-900/10 pb-8">
                        <div className="mt-5 flex flex-col gap-2">
                            <div className={"mt-2"}>
                                <Controller
                                    control={control} // from useForm()
                                    name="members"
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label="Members"
                                            options={users.map((user) => ({
                                                value: user._id,
                                                label: user.email,
                                            }))}
                                            isMulti
                                        />
                                    )}
                                    rules={{
                                        validate: (value) =>
                                            value.length > 0 ||
                                            "Must add members",
                                    }}
                                />
                                {errors.members && (
                                    <p className="text-sm ml-3 mt-1 text-red-500">
                                        {errors.members.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <Button
                            disabled={isLoading}
                            onClick={onClose}
                            type="button"
                            variant="secondary"
                        >
                            Cancel
                        </Button>
                        <Button disabled={isLoading} type="submit">
                            Add
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddMembers;
