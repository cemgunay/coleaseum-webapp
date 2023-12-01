import AuthInput from "@/components/AuthInput";
import CreateListingLayout from "@/components/CreateListingLayout";
import Skeleton from "@/components/Skeleton";
import UtilityItem from "@/components/UtilityItem";
import { useListingForm } from "@/hooks/useListingForm";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

//Validation function for price input.
const validatePrice = (value, name) => {
  console.log(value);
  if (!value) {
    return `${name} is required`;
  } else if (value < 10) {
    return `${name} must be greater than 10`;
  } else if (value.toString().length > 4) {
    return `hmm... maybe make the price more realistic`;
  }
  return null;
};

const Price = () => {
  // Hook to access router functionalities
  const router = useRouter();

  //image
  const image = "coleaseum/rzbb3ej3m3gkk3rsv0ou.png";
  //cloudinary transformations
  const cloudName = "dcytupemt";
  const transformations = "w_200,h_200,c_pad,b_white";
  const transformedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${image}`;
  const blurTransform = "w_30,h_30,c_fill,e_blur:1000,q_auto:low";
  const blurDataURL = `https://res.cloudinary.com/${cloudName}/image/upload/${blurTransform}/${image}`;

  // Extract state and dispatch functions from the custom hook
  const {
    combinedListingFormState,
    combinedListingFormDispatch,
    listingId,
    pushToDatabase,
  } = useListingForm();

  // Destructure price and utilities from the combined listing form state
  const price = combinedListingFormState.price;
  const utilities = combinedListingFormState.utilities;

  // Calculations for various price components
  const basePrice = price;
  const subletFee = basePrice * 0.05;
  const taxes = basePrice * 0.13;
  const guestPrice = basePrice * 1.05 * 1.13;
  const youGet = basePrice * 0.95;

  // State for managing the display of price breakdown details
  const [showDetails, setShowDetails] = useState(false);

  // State to determine if user can proceed to the next step
  const [canGoNext, setCanGoNext] = useState(true);

  // State for handling form validation errors and touch status
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ price: false });

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

  // Handler for price change
  const handleChangePrice = (e) => {
    const { name, value } = e.target;
    const numericalValue = parseFloat(value) || 0;
    combinedListingFormDispatch({
      type: "UPDATE_PRICE",
      payload: numericalValue,
    });
    setErrors({ ...errors, [name]: validate(name, numericalValue) });
    setTouched({ ...touched, [name]: true });
  };

  // Effect to update canGoNext based on validation results
  useEffect(() => {
    if (!errors.price && price && price >= 10) {
      setCanGoNext(true);
    } else {
      setCanGoNext(false);
    }
  }, [price, errors]);

  // Handler for utility changes
  const handleChangeUtilities = (e) => {
    const { name, checked } = e.target;
    combinedListingFormDispatch({
      type: "TOGGLE_UTILITY",
      payload: { name, value: checked },
    });
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const updateData = { price, utilities };
    await pushToDatabase(listingId, updateData, "price");
  };

  // Handler for navigating back in the form
  const handleBack = () => {
    router.push(`/host/create-listing/${listingId}/price`);
  };

  // Component for rendering loading state
  const Loading = () => {
    return (
      <div className="mx-8 my-2 flex flex-col justify-between items-center gap-8">
        {/* Top Section Skeletons */}
        <div className="flex items-center w-full">
          <div className="flex flex-col justify-between items-start text-sm w-3/4">
            <Skeleton className="h-4 w-1/4 mb-2" /> {/* Step number */}
            <Skeleton className="h-6 w-3/4 mb-2" /> {/* Title */}
            <Skeleton className="h-16 w-full mb-2" /> {/* Description */}
          </div>
          <Skeleton className="w-24 h-20 ml-4" /> {/* Image */}
        </div>
        <div className="flex flex-col items-center justify-center w-full gap-2">
          <Skeleton className="h-10 w-28 mb-2" /> {/* Price */}
          <Skeleton className="h-7 w-32 mb-2" /> {/* Guest Price */}
          <Skeleton className="h-20 w-3/4 mb-2" /> {/* Info */}
        </div>

        {/* Utilities Skeletons */}
        <div className="flex flex-col gap-4 w-full">
          <Skeleton className="h-6 w-3/4 mb-2" /> {/* Title */}
          {/* Privacy Types Skeletons */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 w-full">
            {[...Array(11)].map((_, index) => (
              <Skeleton key={index} className="h-14 w-full" /> // Adjust height as per PrivacyTypeOption
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <CreateListingLayout
      Loading={Loading}
      currentStep={8}
      totalSteps={10}
      onNext={handleSubmit}
      onBack={handleBack}
      canGoNext={canGoNext}
    >
      <div className="flex flex-col items-start gap-8 mx-8">
        <div className="flex items-center gap-2">
          <div className="flex flex-col justify-between gap-2 w-3/4">
            <div className="font-bold text-lg">Step 4</div>
            <div className="text-lg">Finish up and publish</div>
            <div className="font-light text-sm">
              Finally, you'll set your monthly price and answer a few quick
              questions and publish when you're ready.
            </div>
          </div>
          <div className="w-1/4">
            <Image
              src={transformedImage}
              alt={transformedImage}
              width={100}
              height={100}
              placeholder="blur"
              blurDataURL={blurDataURL}
            />
          </div>
        </div>
        <div className="w-full flex flex-col gap-4">
          <form
            className="flex justify-center space-x-2 w-full"
            id="price"
            onSubmit={handleSubmit}
          >
            <div className="text-lg font-semibold pt-3">$</div>
            <AuthInput
              name="price"
              type="number"
              value={price || ""}
              onChange={handleChangePrice}
              onBlur={handleBlur}
              error={errors.price}
              touched={touched.price}
              className="w-24"
            />
          </form>

          {!errors.price && !showDetails && (
            <div className="flex flex-col w-full justify-center">
              {/* Price Display and Dropdown Toggle */}
              <div
                className="flex justify-center items-center cursor-pointer gap-2"
                onClick={() => setShowDetails(!showDetails)}
              >
                <div>Guest Price</div>
                <div className="flex items-center gap-2">
                  <div>${guestPrice.toFixed(2)}</div>

                  {showDetails ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>
            </div>
          )}

          {/* Price Breakdown Dropdown */}
          {showDetails && (
            <div className="flex flex-col w-full gap-2">
              <div className="border-2 rounded border-color-secondary-dark p-4 flex flex-col">
                <div className="flex justify-between">
                  <div>Base Price</div>
                  <div>${basePrice.toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                  <div>Sublet Fee</div>
                  <div>${subletFee.toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                  <div>Taxes</div>
                  <div>${taxes.toFixed(2)}</div>
                </div>
                <div className="flex justify-between font-bold">
                  <div>Guest Price</div>
                  <div>${guestPrice.toFixed(2)}</div>
                </div>
              </div>
              <div className="border-2 rounded border-color-secondary-light p-4 flex flex-col">
                <div className="flex justify-between font-bold">
                  <div>You get</div>
                  <div>${youGet.toFixed(2)}</div>
                </div>
                <div className="text-xs">After 5% coleaseum fee</div>
              </div>
              <div
                onClick={() => setShowDetails(!showDetails)}
                className="flex justify-center items-center cursor-pointer gap-2"
              >
                <div>Show Less</div>
                {showDetails ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </div>
          )}
          <div>
            Sublets like yours in your area usually range from $1000 to $1200.
            (based on location, amenities, nearby prices, and demand)
          </div>
        </div>
        <div className="w-full flex flex-col gap-4">
          <div className="text-lg">What's included in the price?</div>
          <div className="grid grid-cols-2 gap-4">
            {utilities &&
              Object.keys(utilities).map((utility) => (
                <UtilityItem
                  key={utility}
                  utilityName={utility}
                  utilityValue={utilities[utility]}
                  handleChange={handleChangeUtilities}
                />
              ))}
          </div>
        </div>
      </div>
    </CreateListingLayout>
  );
};

export default Price;
