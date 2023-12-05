import CreateListingLayout from "@/components/CreateListingLayout";
import DatePicker from "@/components/DatePicker";
import Skeleton from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { useListingForm } from "@/hooks/useListingForm";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { parseISO } from "date-fns";

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

const Dates = () => {
    const router = useRouter();

    const {
        combinedListingFormState,
        combinedListingFormDispatch,
        listingId,
        pushToDatabase,
    } = useListingForm();

    const [canGoNext, setCanGoNext] = useState(false);

    useEffect(() => {
        const hasValidMoveInDate = combinedListingFormState.moveInDate !== null;
        const hasValidMoveOutDate =
            combinedListingFormState.moveOutDate !== null;
        const hasValidViewingDates =
            combinedListingFormState.viewingDates.every(
                (date) => date !== null
            );

        setCanGoNext(
            hasValidMoveInDate &&
                hasValidMoveOutDate &&
                (combinedListingFormState.viewingDates.length === 0 ||
                    hasValidViewingDates)
        );
    }, [combinedListingFormState]);

    const handleDateChange = (newDate, property) => {
        if (property.includes("viewingDates")) {
            const index = parseInt(property.split("[")[1].split("]")[0], 10);
            const updatedViewingDates = [
                ...combinedListingFormState.viewingDates,
            ];
            updatedViewingDates[index] = newDate;
            combinedListingFormDispatch({
                type: "UPDATE_VIEWING_DATES",
                payload: updatedViewingDates,
            });
        } else if (property === "moveInDate") {
            combinedListingFormDispatch({
                type: "UPDATE_MOVE_IN_DATE",
                payload: newDate,
            });
        } else if (property === "moveOutDate") {
            combinedListingFormDispatch({
                type: "UPDATE_MOVE_OUT_DATE",
                payload: newDate,
            });
        }
    };

    // Example of handling adding a new viewing date
    const handleAddViewingDate = () => {
        combinedListingFormDispatch({ type: "ADD_VIEWING_DATE" });
    };

    // Example of handling removing a viewing date
    const handleRemoveViewingDate = (indexToRemove) => {
        combinedListingFormDispatch({
            type: "REMOVE_VIEWING_DATE",
            payload: { index: indexToRemove },
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        //format data for update
        const updateData = {
            moveInDate: combinedListingFormState.moveInDate,
            moveOutDate: combinedListingFormState.moveOutDate,
            viewingDates: combinedListingFormState.viewingDates,
        };

        //call the function to push to database from context
        await pushToDatabase(listingId, updateData, "publish");
    };

    const handleBack = () => {
        router.push(`/host/create-listing/${listingId}/description`);
    };

    const Loading = () => {
        return (
            <div className="mx-8 mb-4 h-full flex flex-col gap-8">
                <div className="w-full flex flex-col gap-3">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-16 w-full" />
                </div>
                <div className="w-full flex flex-col gap-4">
                    <Skeleton className="h-16 w-3/4" />
                    <Skeleton className="h-16 w-3/4" />
                </div>
                <div className="w-full flex flex-col gap-4">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-16 w-3/4" />
                    <Skeleton className="h-16 w-3/4" />
                    <Skeleton className="h-16 w-3/4" />
                </div>
            </div>
        );
    };

    console.log(combinedListingFormState);

    return (
        <CreateListingLayout
            Loading={Loading}
            currentStep={9}
            totalSteps={10}
            onNext={handleSubmit}
            onBack={handleBack}
            canGoNext={canGoNext}
        >
            <div className=" mx-8 flex flex-col items-start gap-8">
                <div className="flex flex-col gap-2">
                    <div>Set your dates</div>
                    <div className="text-sm font-light">
                        Choose your move-in and move-out dates and viewing
                        dates. Don't worry you can always change these later.
                    </div>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col w-full gap-8"
                >
                    <div className="flex flex-col w-3/4 gap-4">
                        {/* move in input */}
                        <div className="flex flex-col">
                            <label className="text-base font-medium text-slate-900 mb-1 ml-0">
                                Move In Date
                            </label>
                            <DatePicker
                                formData={combinedListingFormState}
                                setFormData={(newDate, index) =>
                                    handleDateChange(newDate, index)
                                }
                                propertyToUpdate={"moveInDate"}
                                minDate={new Date()}
                            />
                        </div>
                        {/* move out input */}
                        <div className="flex flex-col">
                            <label className="text-base font-medium text-slate-900 mb-1 ml-0">
                                Move Out Date
                            </label>
                            <DatePicker
                                formData={combinedListingFormState}
                                setFormData={(newDate, index) =>
                                    handleDateChange(newDate, index)
                                }
                                propertyToUpdate={"moveOutDate"}
                                minDate={getValidDate(
                                    combinedListingFormState.moveInDate
                                )}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div>Viewing Dates</div>
                        {/* Viewing Dates component */}
                        {combinedListingFormState.viewingDates.map(
                            (viewingDate, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col flex-grow gap-1"
                                >
                                    <label className="text-base font-medium text-slate-900">
                                        Viewing Date {index + 1}
                                    </label>
                                    <div className="flex items-center justify-between gap-3">
                                        <DatePicker
                                            className="w-3/4"
                                            formData={viewingDate}
                                            setFormData={(newDate) =>
                                                handleDateChange(
                                                    newDate,
                                                    `viewingDates[${index}]`
                                                )
                                            }
                                            propertyToUpdate={`viewingDates[${index}]`}
                                            minDate={new Date()}
                                            maxDate={getValidDate(
                                                combinedListingFormState.moveInDate
                                            )}
                                        />
                                        <div
                                            onClick={() =>
                                                handleRemoveViewingDate(index)
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
                </form>
            </div>
        </CreateListingLayout>
    );
};

export default Dates;
