import { CircularProgress } from "@mui/material";
import { Button } from "./ui/button";

const ProgressBar = ({ currentStep, totalSteps }) => {
    const progress = (currentStep / totalSteps) * 100;
    return (
        <div className="w-full bg-gray-200  h-2.5 dark:bg-gray-700">
            <div
                className="bg-black h-2.5"
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
};

const CreateListingBottomBar = ({
    currentStep,
    totalSteps,
    onBack,
    onNext,
    canGoNext,
    pushing,
}) => (
    <div className="flex flex-col gap-4 fixed inset-x-0 bottom-0 bg-white pb-4 z-10">
        <div>
            <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        <div className="flex justify-between mx-8">
            <Button
                variant="outline"
                className="text-sm text-slate-600 underline border-0 px-0"
                onClick={onBack}
                disabled={pushing}
            >
                Back
            </Button>
            <Button
                className="bg-color-primary text-white mx-0 w-1/2"
                onClick={onNext}
                disabled={!canGoNext || pushing}
            >
                {pushing ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    "Next"
                )}
            </Button>
        </div>
    </div>
);

export default CreateListingBottomBar;
