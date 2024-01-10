import AuthTextArea from "@/components/AuthTextArea";
import CreateListingLayout from "@/components/CreateListingLayout";
import Skeleton from "@/components/Skeleton";
import { useListingForm } from "@/hooks/useListingForm";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

//Validation function for description input.
const validateDescription = (value, name) => {
    if (!value) {
        return null;
    } else if (value.length < 10) {
        return `${name} must be more than 10 characters`;
    }
    return null;
};

const Description = () => {

    //initialize router
    const router = useRouter();

    //get context from listing form
    const {
        combinedListingFormState,
        combinedListingFormDispatch,
        listingId,
        pushToDatabase,
    } = useListingForm();

    //declare description for shorthand
    const description = combinedListingFormState.description;

    //will track the number of characters
    const [count, setCount] = useState(description?.length || 0);

    // State for handling form validation errors and touch status
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({ description: false });

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
            case "description":
                return validateDescription(value, "Description");
            default:
                return null;
        }
    };

    //to determine if we can proceed to next page
    const [canGoNext, setCanGoNext] = useState(false);

    //Effect to update canGoNext based on validation results
    useEffect(() => {
        setCanGoNext(
            !errors.description || (errors.description === null && description)
        );
    }, [errors]);

    //on change set the number of characters and update listing state using dispatch
    const handleChange = (e) => {
        const { name, value } = e.target;
        const length = value.length;
        setCount(length);

        combinedListingFormDispatch({
            type: "UPDATE_DESCRIPTION",
            payload: value,
        });
        // Validate the actual value, not the length and set the touched and error objects
        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: validate(name, value) });
    };

    //push updated description to database
    const handleSubmit = async (e) => {
        e.preventDefault();

        //format data for update
        const updateData = {
            description,
        };

        //call the function to push to database from context
        await pushToDatabase(listingId, updateData, "price");
    };

    //go back
    const handleBack = () => {
        router.push(`/host/create-listing/${listingId}/title`);
    };

    //loading component
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
            currentStep={7}
            totalSteps={10}
            onNext={handleSubmit}
            onBack={handleBack}
            canGoNext={canGoNext}
        >
            <div className=" mx-8 flex flex-col items-start gap-8">
                <div className="flex flex-col gap-2">
                    <div>Create your description</div>
                    <div className="text-sm font-light">
                        Share any extra details here
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
                        maxLength={165}
                        name="description"
                        placeholder="A lovely description"
                        value={description || ""}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.description}
                        touched={touched.description}
                    />
                    <div>{count}/165</div>
                </form>
            </div>
        </CreateListingLayout>
    );
};

export default Description;
