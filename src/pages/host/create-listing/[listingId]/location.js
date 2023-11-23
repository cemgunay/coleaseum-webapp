import AutocompleteField from "@/components/AutocompleteField";
import CreateListingLayout from "@/components/CreateListingLayout";
import GoogleMap from "@/components/Map";
import Skeleton from "@/components/Skeleton";
import { useListingForm } from "@/hooks/useListingForm";
import { useLoadScript } from "@react-google-maps/api";

const libraries = ["places"];

const Location = () => {
    //get context
    const { combinedListingFormState, combinedListingFormDispatch, loading } =
        useListingForm();

    //name our data variable that we will use
    const data = combinedListingFormState?.listingDetails?.location;

    // set position of map with values from our data
    // if no values then use default (shows waterloo)
    const position = { 
        lat: data.lat || 43.4643, 
        lng: data.lng || -80.5204 
    };
    
    //google maps api load script
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    //to handle property type and privacy type changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Dispatch an action to update location part of the listingDetails
        combinedListingFormDispatch({
            type: "UPDATE_LOCATION",
            payload: { location: value },
        });
    };

    return (
        <CreateListingLayout loading={loading}>
            <div className="mx-8 flex flex-col justify-between items-center gap-8">
                <div className="flex items-center">
                    <div className="flex flex-col justify-between items-start text-sm">
                        <div>Where's your place located?</div>
                        {!isLoaded ? (
                            <Skeleton className="w-full h-screen" />
                        ) : (
                            <AutocompleteField dispatch={combinedListingFormDispatch}/>
                        )}
                    </div>
                </div>
                <GoogleMap position={position} isLoaded={isLoaded} loadError={loadError} />
            </div>
        </CreateListingLayout>
    );
};

export default Location;
