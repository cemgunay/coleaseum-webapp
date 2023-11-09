import React from "react";

const LocationMarker = ({ lat, lng, zoom = 15, size = "600x300", ...props }) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const googleMapsImageURL = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${apiKey}`;

    return (
        <img
            src={googleMapsImageURL}
            alt="Location Map"
            width={size.split("x")[0]}
            height={size.split("x")[1]}
            // style
            {...props}
        />
    );
};

export default LocationMarker;
