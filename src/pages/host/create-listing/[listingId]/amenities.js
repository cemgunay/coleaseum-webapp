import AmenityItem from "@/components/AmenityItem";
import CreateListingLayout from "@/components/CreateListingLayout";
import Skeleton from "@/components/Skeleton";
import { useListingForm } from "@/hooks/useListingForm";
import Image from "next/image";
import { useRouter } from "next/router";

const Amenities = () => {
    const router = useRouter();

    //image
    const image = "coleaseum/n44ewnnfanei8tugkrg9.png";
    //cloudinary transformations
    const cloudName = "dcytupemt";
    const transformations = "w_200,h_200,c_pad,b_white";
    const transformedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${image}`;
    const blurTransform = "w_30,h_30,c_fill,e_blur:1000,q_auto:low";
    const blurDataURL = `https://res.cloudinary.com/${cloudName}/image/upload/${blurTransform}/${image}`;

    const {
        combinedListingFormState,
        combinedListingFormDispatch,
        listingId,
        pushToDatabase,
    } = useListingForm();
    const amenities = combinedListingFormState.amenities;

    const canGoNext = true;

    const handleChange = (e) => {
        const { name, checked } = e.target;
        combinedListingFormDispatch({
            type: "TOGGLE_AMENITY",
            payload: { name: name, value: checked },
        });
    };

    console.log(amenities);

    const handleSubmit = async (e) => {
        e.preventDefault();

        //format data for update
        const updateData = {
            amenities: combinedListingFormState.amenities,
        };

        //call the function to push to database from context
        await pushToDatabase(listingId, updateData, "amenities");
    };

    const handleBack = () => {
        router.push(`/host/create-listing/${listingId}/amenities`);
    };

    const Loading = () => {
        return (
            <div className="mx-8 my-2 flex flex-col justify-between items-center gap-4 pt-2">
                {/* Top Section Skeletons */}
                <div className="flex items-center w-full">
                    <div className="flex flex-col justify-between items-start text-sm w-3/4">
                        <Skeleton className="h-4 w-1/4 mb-2" />{" "}
                        {/* Step number */}
                        <Skeleton className="h-6 w-3/4 mb-2" /> {/* Title */}
                        <Skeleton className="h-24 w-full mb-2" />{" "}
                        {/* Description */}
                    </div>
                    <Skeleton className="w-24 h-20 ml-4" /> {/* Image */}
                </div>

                {/* Amenities Skeletons */}
                <div className="flex flex-col gap-4 w-full">
                    <Skeleton className="h-6 w-3/4 mb-2" /> {/* Title */}
                    {/* Privacy Types Skeletons */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4 w-full">
                        {[...Array(11)].map((_, index) => (
                            <Skeleton key={index} className="h-14 w-full" /> // Adjust height as per PrivacyTypeOption
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <CreateListingLayout
            Loading={Loading}
            currentStep={4}
            totalSteps={5}
            onNext={handleSubmit}
            onBack={handleBack}
            canGoNext={canGoNext}
        >
            <div className="mx-8 flex flex-col justify-between gap-8 pt-2">
                <div className="flex items-center gap-2">
                    <div className="flex flex-col justify-between gap-2 w-3/4">
                        <div className="font-bold text-lg">Step 2</div>
                        <div className="text-lg">Make your place stand out</div>
                        <div className="font-light text-sm">
                            In this step, you'll add some of the amenities your
                            place offers, plus 3 or more photos. Then, you'll
                            create a title and description.
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

                <div className="text-lg">What amenities do you have?</div>
                <form id="amenities" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                        {amenities &&
                            Object.keys(amenities).map((amenity) => (
                                <AmenityItem
                                    key={amenity}
                                    amenityName={amenity}
                                    amenityValue={amenities[amenity]}
                                    handleChange={handleChange}
                                />
                            ))}
                    </div>
                </form>
            </div>
        </CreateListingLayout>
    );
};

export default Amenities;
