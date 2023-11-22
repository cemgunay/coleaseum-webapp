import React from "react";
import ListingItem from "@/components/ListingItem";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { format } from "date-fns";

const ListingItemWithRequests = ({ listing, onDelete, requests }) => {
    // sort requests by date
    requests.sort((r1, r2) => new Date(r2.createdAt) - new Date(r1.createdAt));

    return (
        <div>
            <ListingItem listing={listing} onDelete={onDelete} />

            <Accordion type="single" collapsible className="w-full mt-4">
                <AccordionItem value="requests">
                    <AccordionTrigger>
                        {requests.length} Request{requests.length == 1 ? "" : "s"} for this listing
                    </AccordionTrigger>
                    <AccordionContent>
                        {requests.map((request, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center border-t border-slate-300 py-2 mx-1"
                            >
                                <p>Rejected: ${request.price}</p>
                                <p className="text-slate-300">
                                    {format(new Date(request.createdAt), "yyyy-MM-dd")}
                                </p>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default ListingItemWithRequests;
