import OverviewCard from "@/components/OverviewCard";
import { Button } from "@/components/ui/button";
import { useListingForm } from "@/hooks/useListingForm";
import { CircularProgress } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const Overview = () => {
    //get context
    const { combinedListingFormState, combinedListingFormDispatch } =
        useListingForm();

    //to handle navigation in function
    const router = useRouter();

    //to disable and show loading circle if clicked "get started"
    const [isCreating, setIsCreating] = useState(false);

    //to create a listing when get started is clicked and redirect to first page in form
    const createListing = async () => {
        setIsCreating(true);

        // Prepare the data in the desired format
        const postData = {
            ...combinedListingFormState.listingDetails,
            amenities: combinedListingFormState.amenities,
            utilities: combinedListingFormState.utilities,
            images: combinedListingFormState.images,
        };

        // Log to check the final structure of postData
        console.log("Prepared data for posting:", postData);

        // Call API endpoint to create a listing
        try {
            const response = await fetch("/api/listings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                throw new Error("API call failed");
            }

            // Handle the response
            const createdListing = await response.json();
            console.log("Listing created:", createdListing);

            combinedListingFormDispatch({
                type: "UPDATE_ID",
                payload: createdListing.id,
            });

            router.push(
                `/host/create-listing/${createdListing.id}/about-your-place`
            );
        } catch (error) {
            console.error("Error creating listing:", error);
            setIsCreating(false);
        }
    };

    return (
        <>
            <Link href="/host/create-listing/info">
                <Button
                    variant="outline"
                    size="lg"
                    className="font-normal text-base text-slate-600"
                >
                    Back
                </Button>
            </Link>
            <div className="m-8 flex flex-col items-start gap-8">
                <div>Its easy to get started with subLet</div>
                <div className="flex flex-col justify-between items-center gap-8">
                    <OverviewCard
                        number={1}
                        title="Tell us about your place"
                        description="Share some basic info, like where it is and how many bedroom, beds there are"
                        image="coleaseum/cmlfwyx1lsgrunkdmxgg.png"
                    />
                    <OverviewCard
                        number={2}
                        title="Make it stand out"
                        description="Add 3 or more photos plus a title and description"
                        image="coleaseum/j00seqof0jhgfq8qlzdk.png"
                    />
                    <OverviewCard
                        number={3}
                        title="Get your documents ready"
                        description="Upload all required documents for the sublet. Don’t worry, you can always add later"
                        image="coleaseum/n44ewnnfanei8tugkrg9.png"
                    />
                    <OverviewCard
                        number={4}
                        title="Finish up and publish"
                        description="Set a price and publish your subLet"
                        image="coleaseum/rzbb3ej3m3gkk3rsv0ou.png"
                    />
                </div>
            </div>
            <Button
                variant="outline"
                size="lg"
                className="font-normal text-base text-slate-600"
                onClick={createListing}
                disabled={isCreating}
            >
                {isCreating ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    "Get Started"
                )}
            </Button>
        </>
    );
};

export default Overview;
