import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    getListingsInProgress,
    getListingsCompleted,
    getListingsBooked,
} from "../../services/apiServices";
import { format, parseISO } from "date-fns";
import Image from "next/image";
import { transformCloudinaryImage } from "@/utils/cloudinary";

const ManageListings = () => {
    //get context user from hook
    const { user: contextUser } = useAuth();

    // state for user object that will be fetched from db
    const [user, setUser] = useState(null);

    // other state
    const [error, setError] = useState(null);

    // State Variables
    const [isLoading, setIsLoading] = useState(true);
    const [listingsInProgress, setListingsInProgress] = useState([]);
    const [listingsCompleted, setListingsCompleted] = useState([]);
    const [listingsBooked, setListingsBooked] = useState([]);

    // Fetch Listings
    useEffect(() => {
        async function fetchData(userId) {
            setIsLoading(true);
            try {
                const inProgress = await getListingsInProgress(userId);
                setListingsInProgress(inProgress);

                const completed = await getListingsCompleted(userId);
                setListingsCompleted(completed);

                const booked = await getListingsBooked(userId);
                setListingsBooked(booked);
            } catch (error) {
                console.error("Error fetching listings", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (contextUser?.id) {
            fetchData(contextUser.id);
        }
    }, [contextUser]);

    // Handlers
    const goToOverview = () => {};

    const ListingSection = ({ title, listings }) => {
        console.log(listings)
        return (
            <div className="flex flex-col">
                <div>{title}</div>
                <div className="w-full flex flex-col">
                    {listings.map((listing) => (
                        <ListingItem key={listing._id} listing={listing} />
                    ))}
                </div>
            </div>
        );
    };

    const ListingItem = ({ listing }) => {
        const genericImage =
            "https://res.cloudinary.com/dcytupemt/image/upload/v1700592646/coleaseum/rzbb3ej3m3gkk3rsv0ou.png";

        const imageUrl =
            listing.images.length > 0
                ? listing.images[0].cloudinaryUrl
                : genericImage;

        console.log(listing)

        const transformations = "w_150,h_150,c_pad,b_white";
        const blurTransform = "w_30,h_30,c_fill,e_blur:1000,q_auto:low";

        const { transformedImage, blurDataURL } = transformCloudinaryImage(
            imageUrl,
            transformations,
            blurTransform
        );

        const date = parseISO(listing.createdAt); // Parsing the ISO string to a Date object
        const formattedDate = format(date, "PPP"); // Example format

        const title = listing.title
            ? listing.title
            : `Your listing started on ${formattedDate}`;

        return (
            <div className="flex justify-between">
                <Image
                    src={transformedImage}
                    alt={title}
                    width={80}
                    height={80}
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                />
                <div>{title}</div>
            </div>
        );
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col">
            <div className="flex justify-between">
                <div>
                    {listingsInProgress.length + listingsCompleted.length}{" "}
                    listings
                </div>
                <Link href="/host/create-listing/info">
                    <Button>Create new listing</Button>
                </Link>
            </div>
            {/* Listings */}
            {listingsInProgress.length === 0 &&
            listingsCompleted.length === 0 ? (
                <div>Create a new listing</div>
            ) : (
                <>
                    <ListingSection
                        title="Completed Listings"
                        listings={listingsCompleted}
                    />
                    {listingsBooked.length > 0 && (
                        <ListingSection
                            title="Booked Listings"
                            listings={listingsBooked}
                        />
                    )}
                    <ListingSection
                        title="In Progress Listings"
                        listings={listingsInProgress}
                    />
                </>
            )}
        </div>
    );
};

export default ManageListings;
