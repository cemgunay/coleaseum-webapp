import React, { useState } from "react";
import ListingItem from "@/components/ListingItem";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";
import { TiDelete } from "react-icons/ti";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const ListingItemWithRequests = ({ listing, requests, deleteListing }) => {
    // sort requests by date
    requests.sort((r1, r2) => new Date(r2.createdAt) - new Date(r1.createdAt));

    // state
    const [displayRequests, setDisplayRequests] = useState(requests);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // for toast notifications
    const { toast } = useToast();

    // handler functions for modal + deletion events
    // could have set the state right in the JSX but I think this is more readable
    // also if we ever wanna add like click event tracking or smth it'll be easier to add
    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const startDeleteProcess = (requestId) => {
        setSelectedRequestId(requestId);
        handleOpenModal();
    };

    const handleConfirmDelete = () => {
        handleDeleteRequest(selectedRequestId);
        handleCloseModal();
    };

    const handleCancelDelete = () => {
        handleCloseModal();
    };

    // handle delete request
    const handleDeleteRequest = async (requestId) => {
        try {
            // API call to soft delete the request
            const response = await fetch(`/api/requests/${requestId}/delete`, {
                method: "PATCH",
            });

            // error handling
            if (!response.ok) {
                console.log(response);
                throw new Error("Failed to delete request");
            }

            // console log the deleted request
            const deletedRequest = await response.json();
            console.log(deletedRequest);

            // update requests state
            const updatedRequests = displayRequests.filter((request) => request._id !== requestId);
            setDisplayRequests(updatedRequests);

            // if we just deleted the last request, remove the listing altogether
            // deleteListing is a prop passed down from the parent component
            if (updatedRequests.length === 0) {
                deleteListing(listing._id);
            }

            // toast notification
            toast({
                variant: "default",
                title: "Deleted!",
                description: "RIP to that request ☠️",
            });
        } catch (error) {
            console.log(`Error deleting request: ${error}`);
            toast({
                variant: "destructive",
                title: "Failed to delete request :(",
                description: error,
            });
        }
    };

    return (
        <div>
            {showModal && (
                <ConfirmDeleteDialog
                    open={showModal}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmDelete}
                    onCancel={handleCancelDelete}
                />
            )}
            <ListingItem listing={listing} />

            <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="requests">
                    <AccordionTrigger>
                        {displayRequests.length} Request{displayRequests.length == 1 ? "" : "s"}
                    </AccordionTrigger>
                    <AccordionContent>
                        {displayRequests.length > 7 ? (
                            <ScrollArea type="scroll" className="w-full h-72">
                                {displayRequests.map((request, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center group border-t border-slate-300 py-2 mx-1"
                                    >
                                        <p>Rejected: ${request.price}</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-slate-300 transition-all duration-500 transform translate-x-6 group-hover:-translate-x-1">
                                                {format(new Date(request.createdAt), "yyyy-MM-dd")}
                                            </p>
                                            <button onClick={() => startDeleteProcess(request._id)}>
                                                <TiDelete className="text-2xl text-color-error opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </ScrollArea>
                        ) : (
                            displayRequests.map((request, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center group border-t border-slate-300 py-2 mx-1"
                                >
                                    <p>Rejected: ${request.price}</p>
                                    <div className="flex items-center gap-1">
                                        <p className="text-slate-300 transition-all duration-500 transform translate-x-6 group-hover:-translate-x-1">
                                            {format(new Date(request.createdAt), "yyyy-MM-dd")}
                                        </p>
                                        <button onClick={() => startDeleteProcess(request._id)}>
                                            <TiDelete className="text-2xl text-color-error opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default ListingItemWithRequests;
