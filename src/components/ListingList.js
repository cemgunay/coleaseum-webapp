import React from "react";
import ListingItem from "./ListingItem";

const ListingList = ({ listings }) => {
    return (
        <div className="grid grid-cols-1 gap-8 mt-2">
            {listings.map((listing) => (
                <ListingItem key={listing.id} listing={listing} />
            ))}
        </div>
    );
};

export default ListingList;
