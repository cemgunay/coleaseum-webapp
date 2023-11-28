import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { fetchWithTimeout } from "@/utils/utils";
import { FaCircleChevronLeft } from "react-icons/fa6";
import Carousel from "@/components/Carousel";
import { PiPlusCircleThin, PiMinusCircleThin } from "react-icons/pi";

// get request details on server side
export async function getServerSideProps(context) {
    // make sure we have an API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
        return {
            notFound: true,
        };
    }

    // get request from DB
    const { requestId } = context.params;
    const response = await fetchWithTimeout(`${apiUrl}/api/requests/${requestId}`, {}, 5000);

    // error handling
    if (response.error) {
        console.error("Fetch failed: ", response.error);
        return {
            notFound: true,
        };
    }
    if (!response.ok) {
        if (response.status === 404) {
            return { notFound: true };
        } else {
            throw new Error(`HTTP Error: ${response.status}`);
        }
    }

    const request = await response.json();

    // if request fetch was successful, fetch the associated listing
    if (request && request.listingId) {
        // get listing from DB
        const listingResponse = await fetchWithTimeout(
            `${apiUrl}/api/listings/${request.listingId}`,
            {},
            5000
        );

        // error handling
        if (listingResponse.error || !listingResponse.ok) {
            console.error(
                "Listing fetch failed: ",
                listingResponse.error || `HTTP Error: ${listingResponse.status}`
            );
            // NB if listing fetch fails, we still will render the request info
            // can change this later if we want to
        } else {
            const listing = await listingResponse.json();
            return { props: { request, listing } };
        }
    }

    // return the request alone if we didn't successfully fetch the listing
    return { props: { request } };
}

const Request = ({ request, listing }) => {
    const router = useRouter();

    // const [priceOffer, setPriceOffer] = useState(request.price);
    const [priceOffer, setPriceOffer] = useState(10000);

    // Derived state or computations
    const { formattedAddress, formattedRoomInfo, listingImages } = useMemo(() => {
        if (!listing) {
            return {
                formattedAddress: "",
                numBeds: 0,
                numBedrooms: 0,
                numBathrooms: 0,
                formattedRoomInfo: "",
                images: [],
            };
        }

        const formattedAddress = `${listing.location.address1}, ${listing.location.city}, ${listing.location.stateprovince}`;
        const numBeds = listing.basics.bedrooms.map((bedroom) => bedroom.bedType).length;
        const numBedrooms = listing.basics.bedrooms.length;
        const numBathrooms = listing.basics.bathrooms;
        const formattedRoomInfo = `${numBeds} bed${
            numBeds === 1 ? "" : "s"
        } • ${numBedrooms} bedroom${numBedrooms === 1 ? "" : "s"} • ${numBathrooms} bathroom${
            numBathrooms === 1 ? "" : "s"
        }`;
        const listingImages = listing.images.map(({ url }) => url);

        return {
            formattedAddress,
            formattedRoomInfo,
            listingImages,
        };
    }, [listing]);

    // handler functions for price offer
    const [buttonClicked, setButtonClicked] = useState(false);

    const handleDecrementPrice = () => {
        setPriceOffer((prevPrice) => (prevPrice > 0 ? prevPrice - 25 : 0));
        setButtonClicked(true);
    };

    const handleIncrementPrice = () => {
        setPriceOffer((prevPrice) => prevPrice + 25);
        setButtonClicked(true);
    };

    return (
        <>
            {/* Back button */}
            <div className="absolute top-11 left-4 w-fit z-[100]" onClick={router.back}>
                <FaCircleChevronLeft className="text-2xl text-gray-800" />
            </div>

            {/* Main content */}
            <div className="flex flex-col text-black overflow-hidden pb-24">
                {/* title */}
                <div className="w-full h-8 bg-slate-200 font-medium flex justify-center items-center">
                    REQUEST TO SUBLET
                </div>

                {/* Main image carousel */}
                <div className="w-full h-60">
                    <Carousel
                        images={listingImages}
                        // onClick={() => setShowGrid(true)}
                        index={0}
                        dots={true}
                    />
                </div>

                {/* Request info */}
                <div className="flex flex-col mx-8 pt-2">
                    <div className="py-4 border-b-[0.1rem] border-gray-300">
                        <div className="flex justify-between">
                            <h3 className="text-2xl font-bold">{listing.title}</h3>
                            <p>{listing.days_left}</p>
                        </div>
                        <address className="text-lg">{formattedAddress}</address>
                        <p className="mt-2 text-xl">{formattedRoomInfo}</p>
                    </div>
                    <div className="py-4 border-b-[0.1rem] border-gray-300">
                        <h3 className="text-2xl font-bold mb-2">Price Offer</h3>
                        <div className="w-full flex justify-center items-center gap-5">
                            <PiMinusCircleThin
                                onClick={handleDecrementPrice}
                                className="text-4xl text-color-primary hover:cursor-pointer"
                            />
                            <input
                                type="text"
                                value={`$${priceOffer.toLocaleString()}`}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, "");
                                    setPriceOffer(parseInt(value, 10) || 0);
                                }}
                                onSelect={(e) => {
                                    if (buttonClicked) {
                                        e.preventDefault();
                                        setButtonClicked(false);
                                    }
                                }}
                                onClick={() => setButtonClicked(false)}
                                className="text-slate-700 border rounded-md py-[2px] text-lg select-none w-28 text-center"
                            />
                            <PiPlusCircleThin
                                onClick={handleIncrementPrice}
                                className="text-4xl text-color-primary hover:cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Request;
