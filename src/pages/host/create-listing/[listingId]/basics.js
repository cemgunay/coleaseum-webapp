import CreateListingLayout from "@/components/CreateListingLayout";
import IncrementalBedroomInput from "@/components/IncrementalBedroomInput";
import IncrementalBathroomInput from "@/components/IncrementalBathroomInput";
import Skeleton from "@/components/Skeleton";
import { useListingForm } from "@/hooks/useListingForm";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import BedroomItem from "@/components/BedroomItem";

const basics = () => {
    //initialize router
    const router = useRouter();

    //get context from listing form
    const {
        combinedListingFormState,
        combinedListingFormDispatch,
        listingId,
        pushToDatabase,
    } = useListingForm();

    //state variables that will be used in component for shorthand
    const basics = combinedListingFormState.basics;
    const bedrooms = basics.bedrooms;
    const numberOfBedrooms = bedrooms.length;
    const bathrooms = basics.bathrooms;

    //to determine if we can proceed to next page
    const [canGoNext, setCanGoNext] = useState(false);

    //set can go next based on following checks
    useEffect(() => {
        // Check if bedrooms array is not empty
        const hasBedrooms = bedrooms.length > 0;

        // Check if every bedroom has a non-empty bedTypes array
        const everyBedroomHasBedTypes = bedrooms.every(
            (bedroom) => bedroom.bedType && bedroom.bedType.length > 0
        );

        // Update canGoNext state
        setCanGoNext(hasBedrooms && everyBedroomHasBedTypes);
    }, [bedrooms]); // Dependency array - this effect runs when bedrooms array changes

    //push updated basics object to database
    const handleSubmit = async (e) => {
        e.preventDefault();

        //format data for update
        const updateData = {
            basics: combinedListingFormState.basics,
        };

        //call the function to push to database from context
        await pushToDatabase(listingId, updateData, "amenities");
    };

    // go back
    const handleBack = () => {
        router.push(`/host/create-listing/${listingId}/location`);
    };

    //loading component
    const Loading = () => {
        return (
            <div className="mx-8 flex flex-col gap-4">
                <Skeleton className="h-14 w-3/4 mb-2" />
                <Skeleton className="h-20 w-full mb-2" />
            </div>
        );
    };

    return (
        <CreateListingLayout
            Loading={Loading}
            currentStep={3}
            totalSteps={10}
            onNext={handleSubmit}
            onBack={handleBack}
            canGoNext={canGoNext}
        >
            <div className=" mx-8 flex flex-col items-start gap-8">
                <div className="flex flex-col gap-2">
                    <div>Share some basics about your place</div>
                    <div className="text-sm font-light">
                        You can add more detail later, like bed types
                    </div>
                </div>
                <div className="w-full flex flex-col justify-between items-center gap-4">
                    <div className="w-full flex justify-between items-center">
                        <div>Bedrooms</div>
                        <IncrementalBedroomInput
                            basics={basics}
                            bedrooms={bedrooms}
                            numberOfBedrooms={numberOfBedrooms}
                            dispatch={combinedListingFormDispatch}
                        />
                    </div>
                    <div className="w-full flex justify-between items-center">
                        <div>Bathrooms</div>
                        <IncrementalBathroomInput
                            bathrooms={bathrooms}
                            dispatch={combinedListingFormDispatch}
                        />
                    </div>
                </div>

                {numberOfBedrooms > 0 &&
                    bedrooms.map((bedroom, index) => (
                        <BedroomItem
                            key={index}
                            index={index}
                            bedrooms={bedrooms}
                            bedroom={bedroom}
                            dispatch={combinedListingFormDispatch}
                        />
                    ))}
            </div>
        </CreateListingLayout>
    );
};

export default basics;
