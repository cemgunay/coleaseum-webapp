import OverviewCard from "@/components/OverviewCard";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useListingForm } from "@/hooks/useListingForm";
import { CircularProgress } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

const Overview = () => {
    //get context
    const { combinedListingFormState, combinedListingFormDispatch } =
        useListingForm();

    const { toast } = useToast();

    //to handle navigation in function
    const router = useRouter();

    //to disable and show loading circle if clicked "get started"
    const [isCreating, setIsCreating] = useState(false);

    //Function to create a new listing. It posts data to the API and then redirects the user to the first page of the form
    const createListing = async () => {
        // Indicate the start of the creation process.
        setIsCreating(true);

        // Prepare the data in the desired format, including the user ID.
        const postData = { userId: combinedListingFormState.userId };

        // Call the API endpoint to create a new listing.
        try {
            const response = await fetch("/api/listings", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(postData),
            });

            // If the response status is not OK, throw an error to be caught by the catch block.
            if (!response.ok) {
                throw new Error(
                    `API call failed with status: ${response.status}`
                );
            }

            // Parse the JSON response and update the context with the new listing ID.
            const createdListing = await response.json();
            combinedListingFormDispatch({
                type: "UPDATE_ID",
                payload: createdListing.id,
            });

            // Redirect to the next page in the listing creation process.
            router.push(
                `/host/create-listing/${createdListing.id}/about-your-place`
            );
        } catch (error) {
            // Log and handle the error.
            console.error("Error creating listing:", error);

            // Reset the creating state and potentially notify the user.
            setIsCreating(false);

            toast({
                variant: "destructive",
                title: "Uh oh, something went wrong.",
                description: error.message,
            });
        }
    };

    return (
        <div className="flex flex-col justify-between h-screen">
            <div className="mx-8 mt-8">
                <Link href="/host/create-listing/info">
                    <Button
                        variant="outline"
                        className="text-sm text-color-secondary-dark"
                    >
                        Back
                    </Button>
                </Link>
            </div>

            <div className="flex-grow overflow-auto mx-8 mt-10">
                <div className="text-2xl mb-10">
                    It's easy to get started with subLet
                </div>
                <div className="flex flex-col gap-8">
                    <OverviewCard
                        number={1}
                        title="Tell us about your place"
                        description="Share some basic info, like where it is and how many bedrooms, beds there are"
                        image="cmlfwyx1lsgrunkdmxgg.png"
                    />
                    <OverviewCard
                        number={2}
                        title="Make it stand out"
                        description="Add 3 or more photos plus a title and description"
                        image="n44ewnnfanei8tugkrg9.png"
                    />
                    <OverviewCard
                        number={3}
                        title="Get your documents ready"
                        description="Upload all required documents for the sublet. Don’t worry, you can always add later"
                        image="j00seqof0jhgfq8qlzdk.png"
                    />
                    <OverviewCard
                        number={4}
                        title="Finish up and publish"
                        description="Set a price and publish your subLet"
                        image="rzbb3ej3m3gkk3rsv0ou.png"
                    />
                </div>
            </div>

            <div className="mx-8 my-8">
                <Button
                    className="font-normal text-base bg-color-primary text-white w-full"
                    onClick={createListing}
                    disabled={isCreating}
                >
                    {isCreating ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        "Get Started"
                    )}
                </Button>
            </div>
        </div>
    );
};

export default Overview;
