import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CustomDialog = ({
    title,
    description,
    cancel,
    action,
    open,
    onClose,
    onConfirm,
    onCancel,
    bgColor
}) => {
    if (!open) return null;

    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {" "}
                        {title ? title : "Are you sure you want to delete?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {description
                            ? description
                            : "This action cannot be undone."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onCancel}>
                        {cancel ? cancel : "Cancel"}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        className={bgColor ? bgColor : "bg-color-error"}
                    >
                        {action ? action : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default CustomDialog;
