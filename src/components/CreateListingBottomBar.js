import { CircularProgress } from "@mui/material";
import Button from "./Button";

const ProgressBar = ({ currentStep, totalSteps }) => {
    const progress = (currentStep / totalSteps) * 100;
    return (
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
                className="bg-blue-600 h-2.5 rounded-full"
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
    submitting,
}) => (
    <div className="bottom-bar">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        <Button
            variant="outline"
            size="lg"
            className="font-normal text-base text-slate-600"
            onClick={onBack}
        >
            Back
        </Button>
        <Button
            variant="outline"
            size="lg"
            className="font-normal text-base text-slate-600"
            onClick={onNext}
            disabled={!canGoNext || submitting}
        >
            {submitting ? (
                <CircularProgress size={24} color="inherit" />
            ) : (
                "Next"
            )}
        </Button>
    </div>
);

export default CreateListingBottomBar;
