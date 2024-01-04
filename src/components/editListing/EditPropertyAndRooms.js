import { useState } from "react";
import { Button } from "../ui/button";
import { CircularProgress } from "@mui/material";
import PropertyTypeOption from "../PropertyType";
import PrivacyTypeOption from "../PrivacyType";
import IncrementalBedroomInput from "../IncrementalBedroomInput";
import BedroomItem from "../BedroomItem";

import isEqual from "lodash/isEqual";
import IncrementalBathroomInput from "../IncrementalBathroomInput";

const EditPropertyAndRooms = ({
    listing,
    dispatch,
    pushToDatabase,
    pushing,
}) => {
    //editing state variable
    const [isEditingProperty, setIsEditingProperty] = useState(false);
    const [isEditingBedroomsAndBathrooms, setIsEditingBedroomsAndBathrooms] =
        useState(false);
    const [editedAboutYourPlace, setEditedAboutYourPlace] = useState(
        listing.aboutYourPlace
    );
    const [editedBedroomsAndBathrooms, setEditedBedroomsAndBathrooms] =
        useState(listing.basics);

    const isEveryBedroomValid = () => {
        return editedBedroomsAndBathrooms.bedrooms.every((bedroom) => {
            return bedroom.bedType && bedroom.bedType.length > 0;
        });
    };

    //handlers
    const handleEditClickProperty = () => {
        setIsEditingBedroomsAndBathrooms(false);
        setIsEditingProperty(true);
    };
    const handleEditClickBedroomsAndBathrooms = () => {
        setIsEditingProperty(false);
        setIsEditingBedroomsAndBathrooms(true);
    };

    //to toggle the amenity in the state
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Update the state based on the input field name
        switch (name) {
            case "propertyType":
                setEditedAboutYourPlace({
                    ...editedAboutYourPlace,
                    [name]: value,
                });
            case "privacyType":
                setEditedAboutYourPlace({
                    ...editedAboutYourPlace,
                    [name]: value,
                });
                break;
            default:
                break;
        }
    };

    //handle saves
    const handleSave = async (field) => {
        if (field === "property") {
            //format data for update
            const updateData = {
                aboutYourPlace: editedAboutYourPlace,
            };

            //update states
            dispatch({
                type: "UPDATE_ABOUTYOURPLACE",
                payload: updateData.aboutYourPlace,
            });

            //call the function to push to database from context
            await pushToDatabase(listing._id, updateData);

            setIsEditingProperty(false);
        } else if (field === "bedroomsAndBathrooms") {
            //format data for update
            const updateData = {
                basics: editedBedroomsAndBathrooms,
            };

            //update states
            dispatch({
                type: "UPDATE_BASICS",
                payload: updateData.basics,
            });

            //call the function to push to database from context
            await pushToDatabase(listing._id, updateData);

            setIsEditingBedroomsAndBathrooms(false);
        }
    };

    //handle cancel
    const handleCancel = (field) => {
        if (field === "property") {
            setEditedAboutYourPlace(listing.aboutYourPlace);
            setIsEditingProperty(false);
        } else if (field === "bedroomsAndBathrooms") {
            setEditedBedroomsAndBathrooms(listing.basics);
            setIsEditingBedroomsAndBathrooms(false);
        }
    };
    
    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="text-lg font-bold">Property and Rooms</div>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <div className="text-lg">Property</div>
                        {isEditingProperty ? (
                            <div className="flex gap-4 items-center">
                                <Button
                                    size="sm"
                                    variant="link"
                                    className="underline h-6 p-0"
                                    onClick={() => handleSave("property")}
                                    disabled={pushing || isEqual(editedAboutYourPlace, listing.aboutYourPlace)}
                                >
                                    {pushing ? (
                                        <CircularProgress
                                            size={24}
                                            color="inherit"
                                        />
                                    ) : (
                                        "Save"
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="link"
                                    className="h-6 p-0"
                                    onClick={() => handleCancel("property")}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div onClick={handleEditClickProperty}>Edit</div>
                        )}
                    </div>
                </div>
                {isEditingProperty ? (
                    <div className="w-full">
                        <div className="flex flex-col gap-4 w-full">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full">
                                <PropertyTypeOption
                                    data={editedAboutYourPlace}
                                    type="House"
                                    onChange={handleChange}
                                />
                                <PropertyTypeOption
                                    data={editedAboutYourPlace}
                                    type="Apartment"
                                    onChange={handleChange}
                                />
                                <PropertyTypeOption
                                    data={editedAboutYourPlace}
                                    type="Dorm"
                                    onChange={handleChange}
                                />
                                <PropertyTypeOption
                                    data={editedAboutYourPlace}
                                    type="Townnhouse"
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <PrivacyTypeOption
                                    data={editedAboutYourPlace}
                                    type="Entire"
                                    title="An entire place"
                                    description="Subtenants have the whole place to themselves"
                                    onChange={handleChange}
                                />
                                <PrivacyTypeOption
                                    data={editedAboutYourPlace}
                                    type="Private"
                                    title="A private room"
                                    description="Subtenants have a private room but some areas are shared with others"
                                    onChange={handleChange}
                                />
                                <PrivacyTypeOption
                                    data={editedAboutYourPlace}
                                    type="Shared"
                                    title="A shared room"
                                    description="Subtenants share a bedroom"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="font-light flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <div>Property Type:</div>
                                <div>{editedAboutYourPlace.propertyType}</div>
                            </div>
                            <div className="flex gap-2">
                                <div>Privacy Type:</div>
                                <div>{editedAboutYourPlace.privacyType}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <div className="text-lg">Bedrooms and Bathrooms</div>
                        {isEditingBedroomsAndBathrooms ? (
                            <div className="flex gap-4 items-center">
                                <Button
                                    size="sm"
                                    variant="link"
                                    className="underline h-6 p-0"
                                    onClick={() =>
                                        handleSave("bedroomsAndBathrooms")
                                    }
                                    disabled={
                                        pushing ||
                                        isEqual(
                                            editedBedroomsAndBathrooms,
                                            listing.basics
                                        ) ||
                                        !isEveryBedroomValid()
                                    }
                                >
                                    {pushing ? (
                                        <CircularProgress
                                            size={24}
                                            color="inherit"
                                        />
                                    ) : (
                                        "Save"
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="link"
                                    className="h-6 p-0"
                                    onClick={() =>
                                        handleCancel("bedroomsAndBathrooms")
                                    }
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div onClick={handleEditClickBedroomsAndBathrooms}>
                                Edit
                            </div>
                        )}
                    </div>
                </div>
                {isEditingBedroomsAndBathrooms ? (
                    <div className="flex flex-col gap-2">
                        <div className="w-full flex justify-between items-center">
                            <div>Bedrooms</div>
                            <IncrementalBedroomInput
                                basics={editedBedroomsAndBathrooms}
                                bedrooms={editedBedroomsAndBathrooms.bedrooms}
                                numberOfBedrooms={
                                    editedBedroomsAndBathrooms.bedrooms.length
                                }
                                setBedrooms={setEditedBedroomsAndBathrooms}
                            />
                        </div>

                        {editedBedroomsAndBathrooms.bedrooms.length > 0 &&
                            editedBedroomsAndBathrooms.bedrooms.map(
                                (bedroom, index) => (
                                    <BedroomItem
                                        key={index}
                                        index={index}
                                        bedrooms={
                                            editedBedroomsAndBathrooms.bedrooms
                                        }
                                        bedroom={bedroom}
                                        setBedrooms={
                                            setEditedBedroomsAndBathrooms
                                        }
                                    />
                                )
                            )}

                        <div className="w-full flex justify-between items-center">
                            <div>Bathrooms</div>
                            <IncrementalBathroomInput
                                bathrooms={editedBedroomsAndBathrooms.bathrooms}
                                setBathrooms={setEditedBedroomsAndBathrooms}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="font-light flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                                <div>Bedrooms:</div>
                                <div>
                                    {editedBedroomsAndBathrooms.bedrooms.length}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div>Bathrooms:</div>
                                <div>
                                    {editedBedroomsAndBathrooms.bathrooms
                                        ? editedBedroomsAndBathrooms.bathrooms
                                        : 0}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditPropertyAndRooms;
