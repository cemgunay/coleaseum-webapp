import React, { useState } from "react";
import Link from "next/link";
import Carousel from "./Carousel";

const ListingItem = ({ listing }) => {
    const images = listing.images.map(({ url }) => url);

    // get all requests for a listing (populate tenantReqests and subtenantRequests state too)
    // useEffect()...

    // get all active requests for a listing
    // useEffect()...

    // format address string from location info
    const formattedAddress =
        listing.location.address1 +
        ", " +
        listing.location.city +
        ", " +
        listing.location.stateprovince;

    return (
        <Link href="#" className="max-w-lg">
            <div className="w-full h-[13rem] rounded-md">
                <Carousel dots={true} images={images} index={0} from={"Explore"} />
            </div>
            {/* <img
                alt="Listing Image"
                className="w-full rounded-lg mb-1"
                height="150"
                width="350"
                src="/placeholder.svg"
                style={{
                    aspectRatio: "350/150",
                    objectFit: "cover",
                }}
            /> */}
            <div className="flex flex-col">
                <div className="flex justify-between">
                    <h3 className="font-medium">{listing.title}</h3>
                </div>
                <address>{formattedAddress}</address>
                <div className="flex justify-between">
                    <h3 className="font-medium">{listing.price} Highest Offer</h3>
                    <p>No active bids</p>
                </div>
            </div>
        </Link>
    );
};

export default ListingItem;
// TODO:
// - highest active request price calculation
// - tenant requests stuff (i.e. check for active bids, hardcoded to "no active bids" for now)
