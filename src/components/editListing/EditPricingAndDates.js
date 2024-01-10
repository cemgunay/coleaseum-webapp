import { CircularProgress } from "@mui/material";
import { useState } from "react";
import { Button } from "../ui/button";
import AuthInput from "../AuthInput";
import EditUtilities from "./EditUtilities";
import { format, parseISO, startOfDay } from "date-fns";
import DatePickerMovingDates from "../DatePickerMovingDates";
import DatePickerViewingDates from "../DatePickerViewingDates";
import _ from "lodash";

//function to validate that the date provided is a date object and if not parse it
function getValidDate(dateInput) {
    if (typeof dateInput === "string") {
        // Parse the string to a Date object
        return parseISO(dateInput);
    } else if (dateInput instanceof Date) {
        // It's already a Date object
        return dateInput;
    } else {
        // Default case if dateInput is neither a string nor a Date object
        return new Date();
    }
}

//Validation function for price input.
const validatePrice = (value, name) => {
    if (!value) {
        return `${name} is required`;
    } else if (value < 10) {
        return `${name} must be greater than 10`;
    } else if (value.toString().length > 4) {
        return `hmm... maybe make the price more realistic`;
    }
    return null;
};

const EditPricingAndDates = ({
    listing,
    dispatch,
    pushToDatabase,
    pushing,
}) => {
    //editing state variables
    const [isEditingPrice, setIsEditingPrice] = useState(false);
    const [isEditingDates, setIsEditingDates] = useState(false);
    const [editedPrice, setEditedPrice] = useState(listing.price);
    const [editedMoveInDate, setEditedMoveInDate] = useState(
        listing.moveInDate
    );
    const [editedMoveOutDate, setEditedMoveOutDate] = useState(
        listing.moveOutDate
    );
    const [editedViewingDates, setEditedViewingDates] = useState(
        listing.viewingDates
    );

    // State for handling form validation errors and touch status
    const [errors, setErrors] = useState({});
    const [dateError, setDateError] = useState(null);
    const [touched, setTouched] = useState({ price: false });

    // Effect to update if user can save or not
    const canSave = () => {
        if (!errors.price && editedPrice && editedPrice >= 10) {
            return true;
        } else {
            return false;
        }
    };

    // Handler function for input blur event to trigger validation
    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: validate(name, value) });
    };

    // Function to choose the appropriate validation based on input name
    const validate = (name, value) => {
        switch (name) {
            case "price":
                return validatePrice(value, "Price");
            default:
                return null;
        }
    };

    const handleEditPriceClick = () => {
        setIsEditingPrice(true);
    };

    const handleEditDatesClick = () => {
        setIsEditingDates(true);
    };

    // Adding a new viewing date
    const handleAddViewingDate = () => {
        setEditedViewingDates((prevState) => [...prevState, null]);
    };

    // Removing a viewing date
    const handleRemoveViewingDate = (indexToRemove) => {
        setEditedViewingDates((prevState) =>
            prevState.filter((_, index) => index !== indexToRemove)
        );
    };

    const handleMoveInDateChange = (newDate) => {
        if (newDate > getValidDate(editedMoveOutDate)) {
            setDateError(
                "Move-in date cannot be later than move-out date. Please adjust the move-out date first."
            );
            return;
        }
        setDateError(null); // Clear any previous error
        setEditedMoveInDate(newDate);
    };

    const handleMoveOutDateChange = (newDate) => {
        setEditedMoveOutDate(newDate);
    };

    const handleViewingDateChange = (newDate, index) => {
        const updatedViewingDates = [...editedViewingDates];
        updatedViewingDates[index] = newDate;
        setEditedViewingDates(updatedViewingDates);
    };

    // Handler for price change
    const handleChangePrice = (e) => {
        const { name, value } = e.target;
        const numericalValue = parseFloat(value) || 0;
        setEditedPrice(numericalValue);
        setErrors({ ...errors, [name]: validate(name, numericalValue) });
        setTouched({ ...touched, [name]: true });
    };

    const handleSave = async (field) => {
        if (field === "price") {
            const updateData = { editedPrice };
            dispatch({
                type: "UPDATE_PRICE",
                payload: editedPrice,
            });
            await pushToDatabase(listing._id, updateData);
            setIsEditingPrice(false);
        } else if (field === "dates") {
            //format data for update
            const updateData = {
                moveInDate: editedMoveInDate,
                moveOutDate: editedMoveOutDate,
                viewingDates: editedViewingDates,
            };
            dispatch({
                type: "UPDATE_DATES",
                payload: updateData,
            });
            await pushToDatabase(listing._id, updateData);
            setIsEditingDates(false);
        }
    };

    const handleCancel = (field) => {
        if (field === "price") {
            setIsEditingPrice(false);
            setEditedPrice(listing.price);
            // Reset validation state for price
            setErrors((prevErrors) => ({ ...prevErrors, price: null }));
        } else if (field === "dates") {
            setIsEditingDates(false);
            setEditedMoveInDate(listing.moveInDate);
            setEditedMoveOutDate(listing.moveOutDate);
            setEditedViewingDates(listing.viewingDates);
            setDateError(null); // Clear any previous error
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="text-lg font-bold">Pricing and Dates</div>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <div className="text-lg">Price</div>
                        {isEditingPrice ? (
                            <div className="flex gap-4 items-center">
                                <Button
                                    size="sm"
                                    variant="link"
                                    className="underline h-6 p-0"
                                    onClick={() => handleSave("price")}
                                    disabled={
                                        listing.price === editedPrice ||
                                        pushing ||
                                        !canSave()
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
                                    onClick={() => handleCancel("price")}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div onClick={handleEditPriceClick}>Edit</div>
                        )}
                    </div>
                    {isEditingPrice ? (
                        <div className="flex flex-col gap-2">
                            <AuthInput
                                name="price"
                                type="number"
                                value={editedPrice || ""}
                                onChange={handleChangePrice}
                                onBlur={handleBlur}
                                error={errors.price}
                                touched={touched.price}
                                className={"items-center"}
                                classNameInput="w-24"
                                isPrice={true}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 w-full font-light">
                            <div>$</div>
                            <div>{listing.price}</div>
                        </div>
                    )}
                </div>
                <EditUtilities
                    listing={listing}
                    dispatch={dispatch}
                    pushToDatabase={pushToDatabase}
                    pushing={pushing}
                />
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <div className="text-lg">Dates</div>
                        {isEditingDates ? (
                            <div className="flex gap-4 items-center">
                                <Button
                                    size="sm"
                                    variant="link"
                                    className="underline h-6 p-0"
                                    onClick={() => handleSave("dates")}
                                    disabled={
                                        pushing ||
                                        (listing.moveInDate ===
                                            editedMoveInDate &&
                                            listing.moveOutDate ===
                                                editedMoveOutDate &&
                                            _.isEqual(
                                                listing.viewingDates,
                                                editedViewingDates
                                            ))
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
                                    onClick={() => handleCancel("dates")}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div onClick={handleEditDatesClick}>Edit</div>
                        )}
                    </div>
                    {isEditingDates ? (
                        <div className="flex flex-col w-full gap-4">
                            {dateError && (
                                <div className="text-color-error">
                                    {dateError}
                                </div>
                            )}

                            {/* move in input */}
                            <div className="flex flex-col">
                                <label className="text-base font-medium text-slate-900 mb-1 ml-0">
                                    Move In Date
                                </label>
                                <DatePickerMovingDates
                                    date={getValidDate(editedMoveInDate)}
                                    setDate={(newDate) =>
                                        handleMoveInDateChange(newDate)
                                    }
                                    minDate={new Date()}
                                />
                            </div>
                            {/* move out input */}
                            <div className="flex flex-col">
                                <label className="text-base font-medium text-slate-900 mb-1 ml-0">
                                    Move Out Date
                                </label>
                                <DatePickerMovingDates
                                    date={getValidDate(editedMoveOutDate)}
                                    setDate={(newDate) =>
                                        handleMoveOutDateChange(newDate)
                                    }
                                    minDate={getValidDate(editedMoveInDate)}
                                />
                            </div>
                            <div className="flex flex-col gap-4">
                                {/* Viewing Dates component */}
                                {editedViewingDates.map(
                                    (viewingDate, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col flex-grow gap-1"
                                        >
                                            <label className="text-base font-medium text-slate-900">
                                                Viewing Date {index + 1}
                                            </label>
                                            <div className="flex items-center justify-between gap-3">
                                                <DatePickerViewingDates
                                                    className="w-3/4"
                                                    date={getValidDate(
                                                        viewingDate
                                                    )}
                                                    setDate={(newDate) =>
                                                        handleViewingDateChange(
                                                            newDate,
                                                            index
                                                        )
                                                    }
                                                    index={index}
                                                    minDate={startOfDay(
                                                        new Date()
                                                    )}
                                                    maxDate={startOfDay(
                                                        getValidDate(
                                                            editedMoveInDate
                                                        )
                                                    )}
                                                />
                                                <div
                                                    onClick={() =>
                                                        handleRemoveViewingDate(
                                                            index
                                                        )
                                                    }
                                                    className="text-xs"
                                                >
                                                    Remove
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddViewingDate}
                                >
                                    Add New Viewing Date
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2 w-full font-light">
                            <div className="flex items-center gap-2">
                                <div>Move In Date:</div>
                                <div>
                                    {format(
                                        getValidDate(editedMoveInDate),
                                        "PPP"
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div>Move Out Date: </div>
                                <div>
                                    {format(
                                        getValidDate(editedMoveOutDate),
                                        "PPP"
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <div>Viewing Dates: </div>
                                <div className="flex flex-col gap-1">
                                    {editedViewingDates.length > 0 ? (
                                        editedViewingDates.map(
                                            (viewingDate, index) => (
                                                <div key={index}>
                                                    {format(
                                                        getValidDate(
                                                            viewingDate
                                                        ),
                                                        "PPP"
                                                    )}
                                                </div>
                                            )
                                        )
                                    ) : (
                                        <div>No viewing dates</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditPricingAndDates;
