import React, { useState, useEffect } from "react";
import Skeleton from "@/components/Skeleton";
import { format } from "date-fns";
import { formatPrice } from "@/utils/utils";

const RequestItemForHostListing = ({ request }) => {
    // state
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // useEffect to get user info for this request
    useEffect(() => {
        // aync function
        const fetchUser = async () => {
            const response = await fetch(`/api/users/${request?.subTenantId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch subTenant :(");
            }
            const data = await response.json();
            setUser(data);
            setLoading(false);
        };

        fetchUser();
    }, [request]);

    return (
        <div key={request._id} className="flex flex-col rounded-md border border-slate-400 p-3">
            <div className="flex justify-between items-start">
                <p className="text-lg font-bold">{formatPrice(request.price)}</p>
                {loading ? (
                    <Skeleton className="h-5 w-24" />
                ) : (
                    <p className="text-base text-slate-500 -mt-1">{user.firstName}</p>
                )}
            </div>
            <p>
                <span className="font-semibold">Dates: </span>
                {format(new Date(request.startDate), "yyyy-MM-dd")} —{" "}
                {format(new Date(request.endDate), "yyyy-MM-dd")}
            </p>
            <p>
                <span className="font-semibold">Submitted: </span>
                {format(new Date(request.createdAt), "yyyy-MM-dd 'at' h:mm a")}
            </p>
        </div>
    );
};

export default RequestItemForHostListing;
