import Skeleton from "@/components/Skeleton";
import EditAmenities from "@/components/editListing/EditAmenities";
import EditBasics from "@/components/editListing/EditBasics";
import EditLocation from "@/components/editListing/EditLocation";
import { useListingForm } from "@/hooks/useListingForm";
import { BiArrowToRight } from "react-icons/bi";
import { useLoadScript } from "@react-google-maps/api";
import EditPropertyAndRooms from "@/components/editListing/EditPropertyAndRooms";
import EditImages from "@/components/editListing/EditImages";
import EditPricingAndDates from "@/components/editListing/EditPricingAndDates";

//need places library to be able to use autocomplete functions
const libraries = ["places"];

const Edit = () => {
    //get context from listing form
    const {
        combinedListingFormState,
        combinedListingFormDispatch,
        listingId,
        pushToDatabase,
        pushing,
        isLoading,
    } = useListingForm();

    //for shorthand
    const listing = combinedListingFormState;

    //google maps api load script
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const Loading = () => {
        return (
            <div className="m-8 flex flex-col gap-4">
                <div className="flex justify-between pb-4 border-b-2">
                    <Skeleton className={"w-1/3 h-6 "} />
                    <Skeleton className={"w-1/3 h-6 "} />
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Skeleton className={"w-1/2 h-6 "} />
                        <Skeleton className={"w-full h-72 "} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className={"w-1/2 h-6 "} />
                        <Skeleton className={"w-full h-72 "} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className={"w-1/2 h-6 "} />
                        <Skeleton className={"w-full h-72 "} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <Skeleton className={"w-1/2 h-6 "} />
                        <Skeleton className={"w-full h-72 "} />
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="m-8 flex flex-col gap-4">
            <div className="flex justify-between pb-4 border-b-2">
                <div className="font-bold text-lg">{listing.title}</div>
                <div className="flex items-center gap-2">
                    <div>Preview Listing</div>
                    <BiArrowToRight />
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <EditBasics
                    listing={listing}
                    dispatch={combinedListingFormDispatch}
                    pushToDatabase={pushToDatabase}
                    pushing={pushing}
                />
                <EditAmenities
                    listing={listing}
                    dispatch={combinedListingFormDispatch}
                    pushToDatabase={pushToDatabase}
                    pushing={pushing}
                />
                <EditLocation
                    listing={listing}
                    dispatch={combinedListingFormDispatch}
                    pushToDatabase={pushToDatabase}
                    pushing={pushing}
                    isLoaded={isLoaded}
                    loadError={loadError}
                />
                <EditPropertyAndRooms
                    listing={listing}
                    dispatch={combinedListingFormDispatch}
                    pushToDatabase={pushToDatabase}
                    pushing={pushing}
                />
                <EditImages
                    listing={listing}
                    dispatch={combinedListingFormDispatch}
                    pushToDatabase={pushToDatabase}
                    pushing={pushing}
                />
                <EditPricingAndDates
                    listing={listing}
                    dispatch={combinedListingFormDispatch}
                    pushToDatabase={pushToDatabase}
                    pushing={pushing}
                />
            </div>
        </div>
    );
};

export default Edit;
