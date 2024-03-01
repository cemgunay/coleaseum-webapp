import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import Select from "./Select";
import AuthInput from "./AuthInput";

const GroupChatModal = ({ isOpen, onClose, users = [], host }) => {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    //useForm
    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
        trigger,
    } = useForm({
        defaultValues: {
            name: "",
            members: [],
        },
    });

    //create new conversation with members and name
    const onSubmit = async (data) => {
        const isValid = await trigger("members");

        if (!isValid) {
            return;
        }

        setIsLoading(true);

        const apiUrl = host ? "/api/conversations/host" : "/api/conversations";

        try {
            const response = await fetch(apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    isGroup: true,
                }),
            });

            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            if (host) {
                router.push("/host/inbox");
            } else {
                router.push("/inbox");
            }

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
                    <DialogTitle>Create a group chat</DialogTitle>
                    <DialogDescription>
                        Create a chat with more than 2 people
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex flex-col gap-4 border-b border-gray-900/10 pb-8">
                        <div className="mt-5 flex flex-col gap-2">
                            <AuthInput
                                disabled={isLoading}
                                title="Group Name"
                                name="name"
                                placeholder="Goat Squad"
                                error={errors.name?.message} // Pass the error message directly
                                touched={!!errors.name} // 'touched' can be determined by the presence of an error
                                {...register("name", {
                                    required: "Group name is required",
                                    minLength: {
                                        value: 4,
                                        message:
                                            "Group name must be at least 4 characters long",
                                    },
                                })}
                            />
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
                                            value.length >= 2 ||
                                            "Must have more than 2 members",
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
                            Create
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default GroupChatModal;
