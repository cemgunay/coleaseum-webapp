import CreateListingLayout from "@/components/CreateListingLayout";
import Input from "@/components/Input";
import ListingItemPreview from "@/components/ListingItemPreview";
import Skeleton from "@/components/Skeleton";
import { useListingForm } from "@/hooks/useListingForm";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Publish = () => {
    //initialize router
    const router = useRouter();

    //get context from listing form
    const {
        combinedListingFormState,
        combinedListingFormDispatch,
        listingId,
        pushToDatabase,
        setUserBack,
    } = useListingForm();

    //shorthand state for if user agrees to conditions
    const published = combinedListingFormState.published;

    //check to see if we can proceed
    const [canGoNext, setCanGoNext] = useState(published);

    // Function to handle the change event
    const handleOnChange = () => {
        // Update the published status in the form
        const newPublishedValue = !published;
        combinedListingFormDispatch({
            type: "UPDATE_PUBLISHED",
            payload: newPublishedValue,
        });
    };

    // Set the canGoNext state based on the new value of published
    useEffect(() => {
        setCanGoNext(published);
    }, [published]);

    console.log(combinedListingFormState);

    //push updated publish to database
    const handleSubmit = async (e) => {
        e.preventDefault();

        //format data for update
        const updateData = {
            published: true,
        };

        //call the function to push to database from context
        await pushToDatabase(listingId, updateData, "manage-listings");
    };

    //go back
    const handleBack = () => {
        setUserBack(true);
        router.push(`/host/create-listing/${listingId}/dates`);
    };

    //loading component
    const Loading = () => {
        return (
            <div className="mx-8 mb-4 mt-2 flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-72 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        );
    };

    return (
        <CreateListingLayout
            Loading={Loading}
            currentStep={10}
            totalSteps={10}
            onNext={handleSubmit}
            onBack={handleBack}
            canGoNext={canGoNext}
        >
            <div className=" mx-8 flex flex-col items-start gap-8">
                <div className="flex flex-col gap-2">
                    <div>It's time to publish</div>
                    <div className="text-sm font-light">
                        Here’s what we’ll show as your listing. Before you
                        publish, make sure to review the details.
                    </div>
                </div>
                <div className="relative w-full border-2 rounded-md p-2">
                    <ListingItemPreview listing={combinedListingFormState} />
                </div>
                <div className="flex items-center gap-4">
                    <label className="text-sm" htmlFor={"agree"}>
                        SOME FINAL IMPORTANT NOTES THEY MUST CLICK TO AKNOWLEDGE
                        BEFORE POSTING
                    </label>{" "}
                    <Input
                        id={"agree"}
                        type="checkbox"
                        checked={published}
                        onChange={handleOnChange}
                        className="accent-color-primary w-4 h-4 rounded-sm cursor-pointer mr-2 checked:bg-white"
                    />
                </div>
            </div>
        </CreateListingLayout>
    );
};

export default Publish;
