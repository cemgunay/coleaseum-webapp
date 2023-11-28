import React from "react";
import CreateListingBottomBar from "./CreateListingBottomBar";
import CreateListingTopBar from "./CreateListingTopBar";
import { useListingForm } from "@/hooks/useListingForm";

const CreateListingLayout = ({
    Loading,
    children,
    currentStep,
    totalSteps,
    onBack,
    onNext,
    canGoNext,
    onSaveExit,
}) => {
    const { listingId, isLoading, pushing } = useListingForm();

    return (
        <>
            <CreateListingTopBar onSaveExit={onSaveExit} />
            {/* dont render the child component until data has been loaded from DB and listing ID set from query */}
            {isLoading && !listingId ? <Loading /> : <main>{children}</main>}

            <CreateListingBottomBar
                currentStep={currentStep}
                totalSteps={totalSteps}
                onBack={onBack}
                onNext={onNext}
                canGoNext={canGoNext}
                pushing={pushing}
            />
        </>
    );
};

export default CreateListingLayout;
