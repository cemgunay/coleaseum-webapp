import { useState } from "react";
import AuthTextArea from "../AuthTextArea";
import { Button } from "../ui/button";
import { CircularProgress } from "@mui/material";
import CustomDialog from "../CustomDialog";
import { GoDotFill } from "react-icons/go";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

//Validation function for title input.
const validateTitle = (value, name) => {
    if (!value) {
        return `${name} is required`;
    } else if (value.length < 4) {
        return `${name} must be more than 4 characters`;
    }
    return null;
};

//Validation function for description input.
const validateDescription = (value, name) => {
    if (!value) {
        return null;
    } else if (value.length < 10) {
        return `${name} must be more than 10 characters`;
    }
    return null;
};

const EditBasics = ({ listing, dispatch, pushToDatabase, pushing }) => {
    //editing state variables
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [editedTitle, setEditedTitle] = useState(listing.title);
    const [editedDescription, setEditedDescription] = useState(
        listing.description
    );
    const [editedStatus, setEditedStatus] = useState(listing.published);

    //modal states
    const [showUnpublishModal, setShowUnpublishModal] = useState(false);

    //will track the number of title characters
    const [titleCount, setTitleCount] = useState(editedTitle.length || 0);
    //will track the number of description characters
    const [descriptionCount, setDescriptionCount] = useState(
        editedDescription.length || 0
    );

    // State for handling form validation errors and touch status
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({
        title: false,
        description: false,
    });

    // Handler function for input blur event to trigger validation
    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched({ ...touched, [name]: true });

        // Validate on blur
        setErrors({ ...errors, [name]: validate(name, value) });
    };

    // Function to choose the appropriate validation based on input name
    const validate = (name, value) => {
        switch (name) {
            case "title":
                return validateTitle(value, "Title");
            case "description":
                return validateDescription(value, "Description");
            default:
                return null;
        }
    };

    //handlers
    const handleEditTitleClick = () => {
        setIsEditingDescription(false);
        setIsEditingStatus(false);
        setIsEditingTitle(true);
    };

    const handleEditDescriptionClick = () => {
        setIsEditingTitle(false);
        setIsEditingStatus(false);
        setIsEditingDescription(true);
    };

    const handleEditStatusClick = () => {
        setIsEditingTitle(false);
        setIsEditingDescription(false);
        setIsEditingStatus(true);
    };

    //handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        const length = value.length;

        // Set touched state to true for the current field
        setTouched({ ...touched, [name]: true });

        // Perform validation and update errors
        const validationError = validate(name, value);
        setErrors({ ...errors, [name]: validationError });

        if (name === "title") {
            setEditedTitle(value);
            setTitleCount(length);
        } else if (name === "description") {
            setEditedDescription(value);
            setDescriptionCount(length);
        }
    };

    //specifically for status change
    const handleStatusChange = (value) => {
        setEditedStatus(value === "published");
    };

    //handle saves
    const handleSave = async (field) => {
        // Check for validation errors
        if (field === "title" && errors.title) {
            // Don't save if there is an error in title
            return;
        } else if (field === "description" && errors.description) {
            // Don't save if there is an error in description
            return;
        }

        if (field === "title") {
            //update state
            dispatch({
                type: "UPDATE_TITLE",
                payload: editedTitle,
            });

            //format data for update
            const updateData = { title: editedTitle };

            //call the function to push to database from context
            await pushToDatabase(listing._id, updateData);
        } else if (field === "description") {
            //update state
            dispatch({
                type: "UPDATE_DESCRIPTION",
                payload: editedDescription,
            });

            //format data for update
            const updateData = { description: editedDescription };

            //call the function to push to database from context
            await pushToDatabase(listing._id, updateData);
        } else if (field === "status") {
            //update state
            dispatch({
                type: "UPDATE_PUBLISHED",
                payload: editedStatus,
            });

            //format data for update
            const updateData = { published: editedStatus };

            //call the function to push to database from context
            await pushToDatabase(listing._id, updateData);
        }
        setIsEditingTitle(false);
        setIsEditingDescription(false);
        setIsEditingStatus(false);
    };

    //handle cancels
    const handleCancel = (field) => {
        if (field === "title") {
            setEditedTitle(listing.title);
            setIsEditingTitle(false);
            // Reset validation state for title
            setErrors((prevErrors) => ({ ...prevErrors, title: null }));
            setTouched((prevTouched) => ({ ...prevTouched, title: false }));
        } else if (field === "description") {
            setEditedDescription(listing.description);
            setIsEditingDescription(false);
            // Reset validation state for description
            setErrors((prevErrors) => ({ ...prevErrors, description: null }));
            setTouched((prevTouched) => ({
                ...prevTouched,
                description: false,
            }));
        } else if (field === "status") {
            setEditedStatus(listing.published);
            setIsEditingStatus(false);
        }
    };

    //modal handlers
    const handleUnpublishModal = () => {
        if (!editedStatus) {
            setShowUnpublishModal(true);
        } else {
            handleSave("status");
        }
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Unpublish modal */}
            {showUnpublishModal && (
                <CustomDialog
                    open={showUnpublishModal}
                    onClose={() => setShowUnpublishModal(false)}
                    onConfirm={() => handleSave("status")}
                    onCancel={() => setShowUnpublishModal(false)}
                    title={"Are you sure you want to unpublish?"}
                    description={
                        "This will reject all current offers on listing"
                    }
                    action={"Unpublish"}
                />
            )}

            <div className="text-lg font-bold">Listing Basics</div>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <div className="text-lg">Listing title</div>
                        {isEditingTitle ? (
                            <div className="flex gap-4 items-center">
                                <Button
                                    size="sm"
                                    variant="link"
                                    className="underline h-6 p-0"
                                    onClick={() => handleSave("title")}
                                    disabled={
                                        !!errors.title ||
                                        listing.title === editedTitle ||
                                        pushing
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
                                    onClick={() => handleCancel("title")}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div onClick={handleEditTitleClick}>Edit</div>
                        )}
                    </div>
                    {isEditingTitle ? (
                        <div className="flex flex-col gap-2">
                            <AuthTextArea
                                className="w-full"
                                classNameInput="h-32"
                                classNameError="ml-0"
                                maxLength={32}
                                name="title"
                                value={editedTitle}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.title}
                                touched={touched.title}
                            />
                            <div className="font-light">{titleCount}/32</div>
                        </div>
                    ) : (
                        <div className="font-light">{listing.title}</div>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <div className="text-lg">Listing description</div>
                        {isEditingDescription ? (
                            <div className="flex gap-4 items-center">
                                <Button
                                    size="sm"
                                    variant="link"
                                    className="underline h-6 p-0"
                                    onClick={() => handleSave("description")}
                                    disabled={
                                        !!errors.description ||
                                        listing.description ===
                                            editedDescription ||
                                        pushing
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
                                    onClick={() => handleCancel("description")}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div onClick={handleEditDescriptionClick}>Edit</div>
                        )}
                    </div>
                    {isEditingDescription ? (
                        <div className="flex flex-col">
                            <AuthTextArea
                                className="w-full"
                                classNameInput="h-32"
                                classNameError="ml-0"
                                maxLength={165}
                                name="description"
                                value={editedDescription}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.description}
                                touched={touched.description}
                            />
                            <div className="font-light">
                                {descriptionCount}/165
                            </div>
                        </div>
                    ) : (
                        <div className="font-light">{listing.description}</div>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <div className="text-lg">Listing status</div>
                        {isEditingStatus ? (
                            <div className="flex gap-4 items-center">
                                <Button
                                    size="sm"
                                    variant="link"
                                    className="underline h-6 p-0"
                                    onClick={handleUnpublishModal}
                                    disabled={
                                        !!errors.description ||
                                        listing.published === editedStatus ||
                                        pushing
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
                                    onClick={() => handleCancel("status")}
                                >
                                    Cancel
                                </Button>
                            </div>
                        ) : (
                            <div onClick={handleEditStatusClick}>Edit</div>
                        )}
                    </div>
                    {isEditingStatus ? (
                        <RadioGroup
                            className="flex flex-col font-light"
                            defaultValue={
                                listing.published ? "published" : "notPublished"
                            }
                            onValueChange={handleStatusChange}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    id="published"
                                    name="status"
                                    type="radio"
                                    value="published"
                                    className="h-5 w-5 border-color-secondary-light"
                                />
                                <label
                                    className="flex flex-col"
                                    htmlFor="published"
                                >
                                    <div className="flex items-center gap-2">
                                        <GoDotFill
                                            style={{
                                                color: "var(--color-pass)",
                                            }}
                                        />
                                        <div>Published</div>
                                    </div>
                                    <div className="pl-1">
                                        Your listing is publicly viewable and
                                        bookable.
                                    </div>
                                </label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    id="notPublished"
                                    name="status"
                                    type="radio"
                                    value="notPublished"
                                    className="h-5 w-5 border-color-secondary-light"
                                />
                                <label
                                    className="flex flex-col"
                                    htmlFor="notPublished"
                                >
                                    <div className="flex items-center gap-2">
                                        <GoDotFill
                                            style={{
                                                color: "var(--color-error)",
                                            }}
                                        />
                                        <div>Not Published</div>
                                    </div>
                                    <div className="pl-1">
                                        Your listing is not publicly viewable or
                                        bookable.
                                    </div>
                                </label>
                            </div>
                        </RadioGroup>
                    ) : (
                        <div className="flex gap-2 items-center font-light">
                            <GoDotFill
                                style={{
                                    color: listing.published
                                        ? "var(--color-pass)"
                                        : "var(--color-error)",
                                }}
                            />
                            <div>
                                {listing.published
                                    ? "Published"
                                    : "Not Published"}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditBasics;
