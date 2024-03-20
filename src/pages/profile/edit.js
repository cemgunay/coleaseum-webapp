import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import AuthInput from "@/components/AuthInput";
import { Button } from "@/components/ui/button";
import CircularProgress from "@mui/material/CircularProgress";
import { useToast } from "@/components/ui/use-toast";
import Autocomplete from "react-google-autocomplete";
import { cn } from "@/utils/utils";
import DatePickerBirthday from "@/components/DatePickerBirthday";
import { FaChevronLeft } from "react-icons/fa";
import useUser from "@/hooks/useUser";
import Skeleton from "@/components/Skeleton";

//function to validate required
const validateRequired = (value, name) => {
    if (!value) {
        return `${name} is required`;
    }
    return null;
};

const EditProfile = () => {
    const router = useRouter();

    const { user: contextUser, status } = useAuth();

    const formRef = useRef(null);

    // user object from db
    const {
        user: initialUser,
        isLoading,
        error,
    } = useUser(contextUser?.id, null);

    //user state ob
    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        location: "",
    });

    //update the user ob with initialUser from db
    useEffect(() => {
        if (initialUser) {
            setUser(initialUser);
        }
    }, [initialUser]);

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({
        firstName: false,
        lastName: false,
        dateOfBirth: false,
        location: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // handle form input changes
    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    // handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("submitting");

        // validate form
        const newErrors = {
            firstName: validateRequired(user.firstName, "First name"),
            lastName: validateRequired(user.lastName, "Last name"),
            location: validateRequired(user.location, "Location"),
            dateOfBirth: validateRequired(user.dateOfBirth, "Date of birth"),
        };
        setErrors(newErrors);

        // set all touched values to true so all errors are displayed on submit
        let allTouched = {};
        for (let key in touched) {
            allTouched[key] = true;
        }
        setTouched(allTouched);

        const isValid = Object.values(newErrors).every(
            (error) => error === null
        );
        if (isValid) {
            // proceed with form submission
            try {
                setIsSubmitting(true);

                // call signup API route
                const res = await fetch("/api/register", {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(user),
                });
                if (!res.ok) {
                    // update failed, display error message
                    const error = JSON.parse(await res.text()).error;
                    toast({
                        variant: "destructive",
                        title: "Uh oh, something went wrong.",
                        description: error,
                    });
                } else {
                    // update successful
                    toast({
                        variant: "success",
                        title: "Profile udpated",
                    });
                }
                setIsSubmitting(false);
            } catch (error) {
                console.error("update failed", error);
                setIsSubmitting(false);
                throw new Error(
                    `Update failed, error not caught by API route:\n${error}`
                );
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // function to validate when user leaves an input field
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: validate(name, user[name]) });
    };

    // function to choose appropriate validation function
    const validate = (name, value) => {
        switch (name) {
            case "firstName":
                return validateRequired(value, "First name");
            case "lastName":
                return validateRequired(value, "Last name");
            case "location":
                return validateRequired(value, "Location");
            case "dateOfBirth":
                return validateRequired(value, "Date of birth");
            default:
                return null;
        }
    };

    // funky ref stuff to fix the issue where the <Autocomplete /> component was
    // resetting the formData state for some reason.
    // workaround idea taken from: https://github.com/ErrorPro/react-google-autocomplete/issues/168
    const onPlaceSelectedRef = useRef(null);
    useEffect(() => {
        onPlaceSelectedRef.current = (place) => {
            if (place && place.formatted_address) {
                setUser({ ...user, location: place.formatted_address });
            } else {
                return;
            }
        };
    }, [user]);

    const Loading = () => {
        return (
            <div>
                <Skeleton className={"w-4, h-4"} />
            </div>
        );
    };

    if (isLoading || !initialUser) {
        return <Loading />;
    }

    return (
        <div className="flex flex-col items-start justify-start min-h-screen gap-5 mx-8 pt-10 pb-32">
            <div className="flex justify-between items-center w-full">
                <Link href={"/profile"}>
                    <FaChevronLeft />
                </Link>
                {/* submit button */}
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        formRef.current && formRef.current.requestSubmit()
                    }
                >
                    {isSubmitting ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        "Save"
                    )}
                </Button>
            </div>
            <h1 className="text-2xl">Edit Personal Information</h1>

            {/* form */}
            <form
                onSubmit={handleSubmit}
                ref={formRef}
                className="flex flex-col gap-3 w-full"
            >
                {/* date of birth input */}
                <div className="flex flex-col">
                    <label className="text-base font-medium text-slate-900 mb-1 ml-0">
                        Date of Birth
                    </label>
                    <DatePickerBirthday
                        className={
                            touched?.dateOfBirth && errors?.dateOfBirth
                                ? "border-red-500"
                                : ""
                        }
                        formData={user}
                        setFormData={setUser}
                        maxDate={new Date()}
                        error={errors.dateOfBirth}
                        touched={touched.dateOfBirth}
                    />
                    {touched?.dateOfBirth && errors?.dateOfBirth && (
                        <p className="text-sm ml-3 mt-1 text-red-500">
                            {errors?.dateOfBirth}
                        </p>
                    )}
                </div>

                {/* first name input */}
                <AuthInput
                    title="First Name"
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={user.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.firstName}
                    touched={touched.firstName}
                />

                {/* last name input */}
                <AuthInput
                    title="Last Name"
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={user.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.lastName}
                    touched={touched.lastName}
                />

                {/* location input */}
                <div className="flex flex-col">
                    <label className="text-base font-medium text-slate-900 mb-1 ml-0">
                        Location
                    </label>
                    <Autocomplete
                        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                        onPlaceSelected={(place) => {
                            if (onPlaceSelectedRef.current) {
                                onPlaceSelectedRef.current(place);
                                setErrors({
                                    ...errors,
                                    location: validate("location", place),
                                });
                            }
                        }}
                        className={cn(
                            "border rounded-md w-full h-11 px-4 py-2",
                            errors.location && touched.location
                                ? "border-red-500"
                                : "border-slate-300"
                        )}
                        options={{
                            types: ["(cities)"], // restrict search to cities only
                        }}
                        defaultValue={user.location}
                    />
                    {errors.location && touched.location && (
                        <p className="text-sm ml-3 mt-1 text-red-500">
                            {errors.location}
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default EditProfile;
