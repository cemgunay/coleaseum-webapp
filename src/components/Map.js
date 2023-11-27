import { GoogleMap } from "@react-google-maps/api";
import { useRef } from "react";
import Skeleton from "./Skeleton";

const Map = ({
    position,
    isLoaded,
    loadError,
    options,
    combinedListingFormDispatch,
}) => {
    //const center = useMemo(() => position, []);

    //update center when map is stopped being dragged around
    const handleDragEnd = () => {
        const newCenter = mapRef.current.getCenter();
        const newCenterLatLng = { lat: newCenter.lat(), lng: newCenter.lng() };
        combinedListingFormDispatch({
            type: "UPDATE_LOCATION",
            payload: { ...newCenterLatLng },
        });
    };

    //some map ref stuff from documentation idk
    const mapRef = useRef();

    const onLoad = (map) => {
        mapRef.current = map;
    };

    if (!isLoaded) {
        return <Skeleton className="w-full h-screen" />;
    }
    if (loadError) return <div>Error loading maps</div>;

    return (
        <GoogleMap
            zoom={15}
            center={position}
            mapContainerClassName="w-full h-screen"
            options={{
                ...options,
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            }}
            onDragEnd={handleDragEnd}
            onLoad={onLoad}
        ></GoogleMap>
    );
};

export default Map;
