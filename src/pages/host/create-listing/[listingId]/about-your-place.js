import CreateListingLayout from "@/components/CreateListingLayout";
import PrivacyTypeOption from "@/components/PrivacyType";
import PropertyTypeOption from "@/components/PropertyType";
import Skeleton from "@/components/Skeleton";
import { useListingForm } from "@/hooks/useListingForm";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const AboutYourPlace = () => {
    //initialize router
    const router = useRouter();

    //image
    const image = "coleaseum/cmlfwyx1lsgrunkdmxgg.png";
    //cloudinary transformations
    const cloudName = "dcytupemt";
    const transformations = "w_200,h_200,c_pad,b_white";
    const transformedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${image}`;
    const blurTransform = "w_30,h_30,c_fill,e_blur:1000,q_auto:low";
    const blurDataURL = `https://res.cloudinary.com/${cloudName}/image/upload/${blurTransform}/${image}`;

    //get context
    const {
        listingId,
        combinedListingFormState,
        combinedListingFormDispatch,
        pushToDatabase,
        setUserBack
    } = useListingForm();

    //name our data variable that we will use
    const data = combinedListingFormState?.aboutYourPlace;

    //to check if we can proceed to next page
    const [canGoNext, setCanGoNext] = useState(false);

    //to handle property type and privacy type changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Update the state based on the input field name
        switch (name) {
            case "propertyType":
            case "privacyType":
                combinedListingFormDispatch({
                    type: "UPDATE_ABOUT_YOUR_PLACE",
                    payload: { [name]: value },
                });
                break;
            default:
                break;
        }
    };

    //update canGoNext to see if we can submit
    useEffect(() => {
        // Check if both propertyType and privacyType are selected
        const aboutYourPlace = combinedListingFormState.aboutYourPlace;
        if (aboutYourPlace.propertyType && aboutYourPlace.privacyType) {
            setCanGoNext(true);
        } else {
            setCanGoNext(false);
        }
    }, [combinedListingFormState.aboutYourPlace]);

    //when user clicks next button dispatch the push to database
    const handleSubmit = async (e) => {
        e.preventDefault();

        //format data for update
        const updateData = {
            aboutYourPlace: combinedListingFormState.aboutYourPlace,
        };

        //call the function to push to database from context
        await pushToDatabase(listingId, updateData, "location");
    };

    // go back to manage-my-listings (where you see all listings)
    const handleBack = () => {
        setUserBack(true)
        router.push("/host/create-listing/overview");
    };

    //loading component
    const Loading = () => {
        return (
            <div className="mx-8 my-2 flex flex-col justify-between items-center gap-4">
                {/* Top Section Skeletons */}
                <div className="flex items-center w-full">
                    <div className="flex flex-col justify-between items-start text-sm w-3/4">
                        <Skeleton className="h-4 w-1/4 mb-2" />{" "}
                        {/* Step number */}
                        <Skeleton className="h-6 w-3/4 mb-2" /> {/* Title */}
                        <Skeleton className="h-28 w-full mb-2" />{" "}
                        {/* Description */}
                    </div>
                    <Skeleton className="w-24 h-20 ml-4" /> {/* Image */}
                </div>

                {/* Property Types Skeletons */}
                <div className="flex flex-col gap-3 w-full">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 w-full">
                        {[...Array(4)].map((_, index) => (
                            <Skeleton key={index} className="h-16 w-full" /> // Adjust height as per PropertyTypeOption
                        ))}
                    </div>

                    {/* Privacy Types Skeletons */}
                    <div className="grid grid-cols-1 gap-4">
                        {[...Array(3)].map((_, index) => (
                            <Skeleton key={index} className="h-20 w-full" /> // Adjust height as per PrivacyTypeOption
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <CreateListingLayout
            Loading={Loading}
            currentStep={1}
            totalSteps={10}
            onNext={handleSubmit}
            onBack={handleBack}
            canGoNext={canGoNext}
        >
            <div className="mx-8 flex flex-col justify-between items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="flex flex-col justify-between gap-2 w-3/4">
                        <div className="font-bold text-lg">Step 1</div>
                        <div className="text-lg">Tell us about your place</div>
                        <div className="font-light text-sm">
                            In this step, we’ll ask you which type of property
                            you have and if guests will book the entire place or
                            just a room. Then let us know the location and
                            number of bedrooms and beds.
                        </div>
                    </div>
                    <div className="w-1/4">
                        <Image
                            src={transformedImage}
                            alt={transformedImage}
                            width={100}
                            height={100}
                            placeholder="blur"
                            blurDataURL={blurDataURL}
                        />
                    </div>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 w-full"
                >
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full">
                        <PropertyTypeOption
                            data={data}
                            type="House"
                            onChange={handleChange}
                        />
                        <PropertyTypeOption
                            data={data}
                            type="Apartment"
                            onChange={handleChange}
                        />
                        <PropertyTypeOption
                            data={data}
                            type="Dorm"
                            onChange={handleChange}
                        />
                        <PropertyTypeOption
                            data={data}
                            type="Townnhouse"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <PrivacyTypeOption
                            data={data}
                            type="Entire"
                            title="An entire place"
                            description="Subtenants have the whole place to themselves"
                            onChange={handleChange}
                        />
                        <PrivacyTypeOption
                            data={data}
                            type="Private"
                            title="A private room"
                            description="Subtenants have a private room but some areas are shared with others"
                            onChange={handleChange}
                        />
                        <PrivacyTypeOption
                            data={data}
                            type="Shared"
                            title="A shared room"
                            description="Subtenants share a bedroom"
                            onChange={handleChange}
                        />
                    </div>
                </form>
            </div>
        </CreateListingLayout>
    );
};

export default AboutYourPlace;
