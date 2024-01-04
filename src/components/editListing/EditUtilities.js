import { useState } from "react";
import { Button } from "../ui/button";
import { CircularProgress } from "@mui/material";
import UtilityItem from "@/components/UtilityItem";

const EditUtilities = ({ listing, dispatch, pushToDatabase, pushing }) => {
    //editing state variable
    const [isEditing, setIsEditing] = useState(false);
    const [editedUtilities, setEditedUtilities] = useState(listing.utilities);

    //handlers
    const handleEditClick = () => {
        setIsEditing(!isEditing);
    };

    //to toggle the utility in the state
    const handleChange = (e) => {
        const { name, checked } = e.target;
        setEditedUtilities({ ...editedUtilities, [name]: checked });
    };

    //handle saves
    const handleSave = async () => {
        //format data for update
        const updateData = { utilities: editedUtilities };

        //update state
        dispatch({
            type: "TOGGLE_ALL_UTILITIES",
            payload: updateData,
        });

        //call the function to push to database from context
        await pushToDatabase(listing._id, updateData);

        setIsEditing(false);
    };

    //handle cancel
    const handleCancel = () => {
        setEditedUtilities(listing.utilities);
        setIsEditing(false);
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <div className="text-lg">Utilities</div>
                {isEditing ? (
                    <div className="flex gap-4 items-center">
                        <Button
                            size="sm"
                            variant="link"
                            className="underline h-6 p-0"
                            onClick={handleSave}
                            disabled={
                                listing.utilities === editedUtilities || pushing
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
                    {editedUtilities &&
                        Object.keys(editedUtilities).map((utility) => (
                            <UtilityItem
                                key={utility}
                                utilityName={utility}
                                utilityValue={editedUtilities[utility]}
                                handleChange={handleChange}
                            />
                        ))}
                </div>
            ) : (
                <div className="font-light">
                    {listing.utilities &&
                    Object.keys(listing.utilities).filter(
                        (utility) => listing.utilities[utility]
                    ).length > 0 ? (
                        Object.keys(listing.utilities)
                            .filter((utility) => listing.utilities[utility])
                            .map((utility, index) => (
                                <div key={index}>{utility}</div>
                            ))
                    ) : (
                        <div>No utilities included</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EditUtilities;
