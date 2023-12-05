import CreateListingLayout from "@/components/CreateListingLayout";
import Input from "@/components/Input";
import ListingItemPreview from "@/components/ListingItemPreview";
import Skeleton from "@/components/Skeleton";
import { useListingForm } from "@/hooks/useListingForm";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";

const Publish = () => {
    const router = useRouter();

    const {
        combinedListingFormState,
        combinedListingFormDispatch,
        listingId,
        pushToDatabase,
    } = useListingForm();

    console.log(combinedListingFormState);

    const [agree, setAgree] = useState(false);

    const [canGoNext, setCanGoNext] = useState(false);

    // Effect to update canGoNext based on validation results
    useEffect(() => {
        if (agree) {
            setCanGoNext(true);
        } else {
            setCanGoNext(false)
        }
    }, [agree]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        //format data for update
        const updateData = {
            title,
        };

        //call the function to push to database from context
        await pushToDatabase(listingId, updateData, "description");
    };

    const handleBack = () => {
        router.push(`/host/create-listing/${listingId}/images`);
    };

    const Loading = () => {
        return (
            <div className="mx-8 mb-4 h-1/2 flex flex-col gap-4">
                <Skeleton className="h-14 w-full mb-2" />
                <Skeleton className="h-full w-full mb-2" />
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
                        checked={agree}
                        onChange={() => setAgree(!agree)}
                        className="accent-color-primary w-3 h-3 rounded-sm cursor-pointer mr-2 checked:bg-white"
                    />
                </div>
            </div>
        </CreateListingLayout>
    );
};

export default Publish;
