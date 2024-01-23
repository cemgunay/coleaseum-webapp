import CreateListingLayout from "@/components/CreateListingLayout";
import Skeleton from "@/components/Skeleton";
import { Button } from "@/components/ui/button";
import { useListingForm } from "@/hooks/useListingForm";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { startOfDay } from "date-fns";
import DatePickerMovingDates from "@/components/DatePickerMovingDates";
import DatePickerViewingDates from "@/components/DatePickerViewingDates";
import getValidDate from "@/utils/getValidDate";

const Dates = () => {
    //initialize router
    const router = useRouter();

    //get context from listing form
    const {
        combinedListingFormState,
        combinedListingFormDispatch,
        listingId,
        pushToDatabase,
        setUserBack
    } = useListingForm();

    //to determine if we can proceed to next page
    const [canGoNext, setCanGoNext] = useState(false);

    //set can go next based on checks
    useEffect(() => {
        //moveInDate and moveOutDate exist, and IF there is a viewingDate it is not null
        const hasValidMoveInDate = combinedListingFormState.moveInDate !== null;
        const hasValidMoveOutDate =
            combinedListingFormState.moveOutDate !== null &&
            combinedListingFormState.moveOutDate >
                combinedListingFormState.moveInDate;
        const hasValidViewingDates =
            combinedListingFormState.viewingDates.every(
                (date) =>
                    date !== null &&
                    getValidDate(date) <
                        getValidDate(combinedListingFormState.moveInDate)
            );

        setCanGoNext(
            hasValidMoveInDate &&
                hasValidMoveOutDate &&
                (combinedListingFormState.viewingDates.length === 0 ||
                    hasValidViewingDates)
        );
    }, [combinedListingFormState]);

    const [dateError, setDateError] = useState(null);

    const handleMoveInDateChange = (newDate) => {
        if (
            combinedListingFormState.moveOutDate &&
            newDate > getValidDate(combinedListingFormState.moveOutDate)
        ) {
            setDateError(
                "Move-in date cannot be later than move-out date. Please adjust the move-out date first."
            );
        } else {
            setDateError(null);
            combinedListingFormDispatch({
                type: "UPDATE_MOVE_IN_DATE",
                payload: newDate,
            });
        }
    };

    const handleMoveOutDateChange = (newDate) => {
        combinedListingFormDispatch({
            type: "UPDATE_MOVE_OUT_DATE",
            payload: newDate,
        });
    };

    const handleViewingDateChange = (newDate, index) => {
        const updatedViewingDates = [...combinedListingFormState.viewingDates];
        updatedViewingDates[index] = newDate;
        combinedListingFormDispatch({
            type: "UPDATE_VIEWING_DATES",
            payload: updatedViewingDates,
        });
    };

    // Adding a new viewing date
    const handleAddViewingDate = () => {
        combinedListingFormDispatch({ type: "ADD_VIEWING_DATE" });
    };

    // Removing a viewing date
    const handleRemoveViewingDate = (indexToRemove) => {
        combinedListingFormDispatch({
            type: "REMOVE_VIEWING_DATE",
            payload: { index: indexToRemove },
        });
    };

    //push updated moveInDate, moveOutDate and viewingDate to database
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

    //go back
    const handleBack = () => {
        setUserBack(true)
        router.push(`/host/create-listing/${listingId}/price`);
    };

    //loading component
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
                    <div className="flex flex-col gap-4">
                        {dateError && (
                            <div className="text-color-error">{dateError}</div>
                        )}
                        {/* move in input */}
                        <div className="flex flex-col">
                            <label className="text-base font-medium text-slate-900 mb-1 ml-0">
                                Move In Date
                            </label>
                            <DatePickerMovingDates
                                date={getValidDate(
                                    combinedListingFormState.moveInDate
                                )}
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
                                date={getValidDate(
                                    combinedListingFormState.moveOutDate
                                )}
                                setDate={(newDate) =>
                                    handleMoveOutDateChange(newDate)
                                }
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
                                        <DatePickerViewingDates
                                            className="w-3/4"
                                            date={getValidDate(viewingDate)}
                                            setDate={(newDate) =>
                                                handleViewingDateChange(
                                                    newDate,
                                                    index
                                                )
                                            }
                                            minDate={startOfDay(new Date())}
                                            maxDate={startOfDay(
                                                getValidDate(
                                                    combinedListingFormState.moveInDate
                                                )
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
