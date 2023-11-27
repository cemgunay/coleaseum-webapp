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
        router.push("/host/create-listing/overview");
    };

    const Loading = () => {
        return (
            <div className="mx-8 flex flex-col justify-between items-center gap-8">
                <div className="flex items-center w-full">
                    <div className="flex flex-col justify-between items-start text-sm w-full">
                        <Skeleton className="h-4 w-1/4 mb-2" /> {/* Step number */}
                        <Skeleton className="h-24 w-full mb-2" /> {/* Title, increased height */}
                    </div>
                    <Skeleton className="w-24 h-14 ml-4" /> {/* Image, standard size */}
                </div>
                <div className="flex flex-col gap-3 w-full">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full">
                        {[...Array(4)].map((_, index) => (
                            <Skeleton key={index} className="h-14 w-full" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {[...Array(3)].map((_, index) => (
                            <Skeleton key={index} className="h-14 w-full" />
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
            totalSteps={5}
            onNext={handleSubmit}
            onBack={handleBack}
            canGoNext={canGoNext}
        >
            <div className="mx-8 flex flex-col justify-between items-center gap-8">
                <div className="flex items-center">
                    <div className="flex flex-col justify-between items-start text-sm">
                        <div>Step 1</div>
                        <div>Tell us about your place</div>
                        <div>
                            In this step, we’ll ask you which type of property
                            you have and if guests will book the entire place or
                            just a room. Then let us know the location and
                            number of bedrooms and beds
                        </div>
                    </div>
                    <div className="w-18">
                        <Image
                            src={transformedImage}
                            alt={transformedImage}
                            width={200}
                            height={200}
                            placeholder="blur"
                            blurDataURL={blurDataURL}
                        />
                    </div>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3 w-full"
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
