import { useState } from "react";
import { Button } from "../ui/button";
import { CircularProgress } from "@mui/material";
import AmenityItem from "../AmenityItem";

const EditAmenities = ({ listing, dispatch, pushToDatabase, pushing }) => {
    //editing state variable
    const [isEditing, setIsEditing] = useState(false);
    const [editedAmenities, setEditedAmenities] = useState(listing.amenities);

    //handlers
    const handleEditClick = () => {
        setIsEditing(!isEditing);
    };

    //to toggle the amenity in the state
    const handleChange = (e) => {
        const { name, checked } = e.target;
        setEditedAmenities({ ...editedAmenities, [name]: checked });
    };

    //handle saves
    const handleSave = async () => {
        //format data for update
        const updateData = { amenities: editedAmenities };

        //update state
        dispatch({
            type: "TOGGLE_ALL_AMENITIES",
            payload: updateData,
        });

        //call the function to push to database from context
        await pushToDatabase(listing._id, updateData);

        setIsEditing(false);
    };

    //handle cancel
    const handleCancel = () => {
        setEditedAmenities(listing.amenities);
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="flex justify-between items-center">
                <div className="text-lg font-bold">Amenities</div>
                {isEditing ? (
                    <div className="flex gap-4 items-center">
                        <Button
                            size="sm"
                            variant="link"
                            className="underline h-6 p-0"
                            onClick={handleSave}
                            disabled={
                                listing.amenities === editedAmenities || pushing
                            }
                        >
                            {pushing ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Save"
                            )}
                        </Button>
                        <Button
                            size="sm"
                            variant="link"
                            className="h-6 p-0"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <div onClick={handleEditClick}>Edit</div>
                )}
            </div>

            {isEditing ? (
                <div className="grid grid-cols-2 gap-4">
                    {editedAmenities &&
                        Object.keys(editedAmenities).map((amenity) => (
                            <AmenityItem
                                key={amenity}
                                amenityName={amenity}
                                amenityValue={editedAmenities[amenity]}
                                handleChange={handleChange}
                            />
                        ))}
                </div>
            ) : (
                <div className="font-light">
                    {listing.amenities &&
                    Object.keys(listing.amenities).filter(
                        (amenity) => listing.amenities[amenity]
                    ).length > 0 ? (
                        Object.keys(listing.amenities)
                            .filter((amenity) => listing.amenities[amenity])
                            .map((amenity, index) => (
                                <div key={index}>{amenity}</div>
                            ))
                    ) : (
                        <div>No amenities selected</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EditAmenities;
