import { GoogleMap } from "@react-google-maps/api";
import { useMemo } from "react";
import Skeleton from "./Skeleton";

const Map = ({ position, isLoaded, loadError }) => {
    //const center = useMemo(() => position, []);

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
                zoomControl: false,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
            }}
        ></GoogleMap>
    );
};

export default Map;
