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
    const { isLoading, pushing } = useListingForm();

    return (
        <>
            <CreateListingTopBar onSaveExit={onSaveExit} />
            {isLoading ? <Loading /> : <main>{children}</main>}

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
