import Skeleton from "@/components/Skeleton";
import EditBasics from "@/components/editListing/EditBasics";
import { useListingForm } from "@/hooks/useListingForm";
import { BiArrowToRight } from "react-icons/bi";

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

    const listing = combinedListingFormState;

    const Loading = () => {
        return <div>Loading...</div>;
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
            </div>
        </div>
    );
};

export default Edit;
