import CreateListingLayout from "@/components/CreateListingLayout";
import PrivacyTypeOption from "@/components/PrivacyType";
import PropertyTypeOption from "@/components/PropertyType";
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
    const { combinedListingFormState, combinedListingFormDispatch, loading } =
        useListingForm();

    //name our data variable that we will use
    const data = combinedListingFormState?.listingDetails?.aboutYourPlace;

    //to check if we can proceed to next page
    const [canGoNext, setCanGoNext] = useState(false);

    //to check if we are submitting
    const [submitting, setSubmitting] = useState(false)

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
        const aboutYourPlace =
            combinedListingFormState.listingDetails.aboutYourPlace;
        if (aboutYourPlace.propertyType && aboutYourPlace.privacyType) {
            setCanGoNext(true);
        } else {
            setCanGoNext(false);
        }
    }, [combinedListingFormState.listingDetails.aboutYourPlace]);

    //when user clicks next button dispatch the push to database
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setSubmitting(true)

        //format data for update
        const listingId = combinedListingFormState.listingDetails._id;
        const updateData = {
            aboutYourPlace:
                combinedListingFormState.listingDetails.aboutYourPlace,
        };

        try {
            //make fetch
            const response = await fetch(`/api/listings`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ listingId, updateData }),
            });

            if (!response.ok) {
                setSubmitting(false)
                throw new Error("API call failed");
            }

            // Handle the response
            const updatedListing = await response.json();
            console.log("Listing updated:", updatedListing);

            // After successful submission, navigate to the next page
            router.push(`/host/create-listing/${listingId}/location`);
        } catch (error) {
            console.error("Error updating listing:", error);
            setSubmitting(false)

            // ***** put a toast in here

        }
    };

    const handleBack = () => {};

    return (
        <CreateListingLayout
            loading={loading}
            currentStep={1}
            totalSteps={5}
            onNext={handleSubmit}
            onBack={handleBack}
            canGoNext={canGoNext}
            submitting={submitting}
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
