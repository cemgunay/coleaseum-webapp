import React from "react";
import CreateListingBottomBar from "./CreateListingBottomBar";
import CreateListingTopBar from "./CreateListingTopBar";
import Skeleton from "./Skeleton";

// Loading component outside of CreateListingLayout that needs to be more generic
const Loading = () => {
    return (
        <div className="flex flex-col items-start justify-start min-h-screen gap-5 mx-8 pt-10">
            <div className="flex items-center gap-5">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-5 w-52" />
                </div>
            </div>
            <div className="h-[1px] bg-slate-200 w-full" />
            {[...Array(3)].map((_, i) => (
                <div className="flex flex-col gap-5 w-full" key={i}>
                    <div className="flex flex-col gap-3 w-full">
                        <Skeleton className="w-1/3 h-6 mb-1" />
                        <Skeleton className="w-1/4 h-5" />
                        <Skeleton className="w-1/2 h-5" />
                        <Skeleton className="w-1/3 h-5" />
                    </div>
                    <div className="h-[1px] bg-slate-200 w-full" />
                </div>
            ))}
        </div>
    );
};

const CreateListingLayout = ({
    children,
    currentStep,
    totalSteps,
    onBack,
    onNext,
    canGoNext,
    onSaveExit,
    loading,
    submitting
}) => {
    return (
        <>
            <CreateListingTopBar onSaveExit={onSaveExit} />
            {loading ? <Loading /> : <main>{children}</main>}
            <CreateListingBottomBar
                currentStep={currentStep}
                totalSteps={totalSteps}
                onBack={onBack}
                onNext={onNext}
                canGoNext={canGoNext}
                submitting={submitting}
            />
        </>
    );
};

export default CreateListingLayout;
