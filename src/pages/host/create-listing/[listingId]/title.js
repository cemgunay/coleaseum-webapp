import AuthTextArea from "@/components/AuthTextArea";
import CreateListingLayout from "@/components/CreateListingLayout";
import Skeleton from "@/components/Skeleton";
import { useListingForm } from "@/hooks/useListingForm";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

//Validation function for title input.
const validateTitle = (value, name) => {
    if (!value) {
        return `${name} is required`;
    } else if (value.length < 4) {
        return `${name} must be more than 4 characters`;
    }
    return null;
};

const Title = () => {
    const router = useRouter();

    const {
        combinedListingFormState,
        combinedListingFormDispatch,
        listingId,
        pushToDatabase,
    } = useListingForm();

    const title = combinedListingFormState.title;

    const [count, setCount] = useState(title?.length || 0);

    // State for handling form validation errors and touch status
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({ title: false });

    // Handler function for input blur event to trigger validation
    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });

        // Validate on blur
        setErrors({ ...errors, [name]: validate(name, value) });
    };

    // Function to choose the appropriate validation based on input name
    const validate = (name, value) => {
        switch (name) {
            case "title":
                return validateTitle(value, "Title");
            default:
                return null;
        }
    };

    const [canGoNext, setCanGoNext] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const length = value.length;
        setCount(length);

        combinedListingFormDispatch({
            type: "UPDATE_TITLE",
            payload: value,
        });
        // Validate the actual value, not the length
        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: validate(name, value) });
    };

    console.log(errors);

    // Effect to update canGoNext based on validation results
    useEffect(() => {
        // Set canGoNext to true if there are no errors and title is present
        setCanGoNext(!errors.title || (errors.title === null && title));
    }, [errors, title]);

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
            currentStep={6}
            totalSteps={10}
            onNext={handleSubmit}
            onBack={handleBack}
            canGoNext={canGoNext}
        >
            <div className=" mx-8 flex flex-col items-start gap-8">
                <div className="flex flex-col gap-2">
                    <div>Now, let’s give your place a title</div>
                    <div className="text-sm font-light">
                        Short titles work best. You can always change this later
                    </div>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-start w-full"
                >
                    <AuthTextArea
                        className="w-full"
                        classNameInput="h-32"
                        classNameError="ml-0"
                        maxLength={32}
                        name="title"
                        placeholder="A lovely title"
                        value={title || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.title}
                        touched={touched.title}
                    />
                    <div>{count}/32</div>
                </form>
            </div>
        </CreateListingLayout>
    );
};

export default Title;
