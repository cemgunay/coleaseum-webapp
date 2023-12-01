import React from "react";
import CreateListingBottomBar from "./CreateListingBottomBar";
import CreateListingTopBar from "./CreateListingTopBar";
import { useListingForm } from "@/hooks/useListingForm";

const CreateListingLayout = ({
    Loading,
    componentSpecificIsLoading,
    children,
    currentStep,
    totalSteps,
    onBack,
    onNext,
    canGoNext,
    onSaveExit,
}) => {
    const { listingId, isLoading, pushing } = useListingForm();

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
                {componentSpecificIsLoading || isLoading || !listingId ? (
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
