import React from "react";
import CreateListingBottomBar from "./CreateListingBottomBar";
import CreateListingTopBar from "./CreateListingTopBar";
import { useListingForm } from "@/hooks/useListingForm";
import { useRouter } from "next/router";

const CreateListingLayout = ({
    Loading,
    componentSpecificIsLoading,
    children,
    currentStep,
    totalSteps,
    onBack,
    onNext,
    canGoNext,
}) => {
    //get context from listing form
    const { listingId, isLoading, pushing } = useListingForm();

    //initialize router
    const router = useRouter();

    //save and exit button function
    const onSaveExit = async (e) => {
        e.preventDefault();

        //since previous page is already saved we can just navigate away
        router.push("/host/manage-listings");
    };

    //Conditional Check Tests
    //isLoading && !listingId
    //(componentSpecificIsLoading !== false) && (isLoading && !listingId)

    //this is the correct one
    //componentSpecificIsLoading || isLoading || !listingId

    return (
        <div className="flex flex-col justify-between h-screen">
            <CreateListingTopBar onSaveExit={onSaveExit} />
            {/* dont render the child component until data has been loaded from DB and listing ID set from query */}

            <main className="flex-grow py-24">
                {(componentSpecificIsLoading || isLoading || !listingId) &&
                !pushing ? (
                    <Loading />
                ) : (
                    children
                )}
            </main>

            <CreateListingBottomBar
                currentStep={currentStep}
                totalSteps={totalSteps}
                onBack={onBack}
                onNext={onNext}
                canGoNext={canGoNext}
                pushing={pushing}
            />
        </div>
    );
};

export default CreateListingLayout;
