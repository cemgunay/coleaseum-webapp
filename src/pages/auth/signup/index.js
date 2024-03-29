import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/router";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import AuthInput from "@/components/AuthInput";
import { Button } from "@/components/ui/button";
import CircularProgress from "@mui/material/CircularProgress";
import { useToast } from "@/components/ui/use-toast";
import Autocomplete from "react-google-autocomplete";
import { cn } from "@/utils/utils";
import DatePickerBirthday from "@/components/DatePickerBirthday";
import { useAuth } from "@/hooks/useAuth";
import Skeleton from "@/components/Skeleton";
import { BsGoogle } from "react-icons/bs";
import { signIn } from "next-auth/react";
import { IoIosArrowBack } from "react-icons/io";

// function to validate email
const validateEmail = (email) => {
    if (!email) {
        return "Email is required";
    }
    // simple regex for email validation
    const re = /\S+@\S+\.\S+/;
    return re.test(email) ? null : "Invalid email address";
};

// function to validate password
const validatePassword = (password) => {
    // check if password is empty
    if (!password) {
        return "Password is required";
    }

    // check length
    if (password.length < 8) {
        return "Password must be at least 8 characters";
    }

    // // check for uppercase letter (commented out for now)
    // if (!/[A-Z]/.test(password)) {
    //     return "Password must contain at least one uppercase letter";
    // }

    // more conditions here as needed, will discuss w Cem

    // returning null if all conditions met (i.e. no error)
    return null;
};

// function to validate confirm password field
const validateConfirmPassword = (confirmPassword, password) => {
    // ensure passwords are the same
    if (confirmPassword !== password) {
        return "Passwords do not match";
    }

    return null;
};

const validateRequired = (value, name) => {
    if (!value) {
        return `${name} is required`;
    }
    return null;
};

const SignUp = () => {
    const router = useRouter();
    const { status } = useAuth();

    useEffect(() => {
        if (status === "authenticated") {
            // User is already signed in, redirect to home or another page
            router.replace("/");
        }
    }, [status, router]);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: null,
        location: "",
        email: "",
        password: "",
        confirmPassword: "",
        initialEmail: "",
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({
        firstName: false,
        lastName: false,
        dateOfBirth: false,
        location: false,
        email: false,
        password: false,
        confirmPassword: false,
        initialEmail: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const [stage, setStage] = useState("initial");

    // handle form input changes
    const handleChange = (e) => {
        // setFormData({ ...formData, [e.target.name]: e.target.value });
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // handle initial form submission
    const handleInitialSubmit = async (e) => {
        e.preventDefault();

        // validate form
        const newErrors = {
            initialEmail: validateEmail(formData.initialEmail),
        };
        setErrors(newErrors);

        const isValid = Object.values(newErrors).every((error) => error === null);
        if (isValid) {
            // proceed to main form
            setStage("main");

            // remove error for initialEmail (just to be sure main form will submit properly)
            setErrors({ ...errors, initialEmail: null });

            // set email in formData to initialEmail
            setFormData({ ...formData, email: formData.initialEmail });
        }
    };

    // handle main form submission
    const handleMainSubmit = async (e) => {
        e.preventDefault();

        // validate form
        const newErrors = {
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
            confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
            firstName: validateRequired(formData.firstName, "First name"),
            lastName: validateRequired(formData.lastName, "Last name"),
            location: validateRequired(formData.location, "Location"),
            dateOfBirth: validateRequired(formData.dateOfBirth, "Date of birth"),
            // can add more if we need
        };
        setErrors(newErrors);

        // set all touched values to true so all errors are displayed on submit
        let allTouched = {};
        for (let key in touched) {
            allTouched[key] = true;
        }
        setTouched(allTouched);

        const isValid = Object.values(newErrors).every((error) => error === null);
        if (isValid) {
            // proceed with form submission
            try {
                setIsSubmitting(true);

                // call signup API route
                const res = await fetch("/api/register", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) {
                    // signup failed, display error message
                    const error = JSON.parse(await res.text()).error;
                    toast({
                        variant: "destructive",
                        title: "Uh oh, something went wrong.",
                        description: error,
                    });
                } else {
                    // signup successful, save user in context and redirect to profile page
                    const user = await res.json();
                    //const user = jwtDecode(data.token).user;
                    localStorage.setItem("email", user.email);

                    //saveUser(user, data.token);
                    router.push("/auth/signup/verification");
                }
                setIsSubmitting(false);
            } catch (error) {
                console.error("Signup failed", error);
                setIsSubmitting(false);
                throw new Error(`Signup failed, error not caught by API route:\n${error}`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    //handle social sign in
    const handleSocialClick = (action) => {
        signIn(action, { callbackUrl: "/profile" });
    };

    // function to validate when user leaves an input field
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: validate(name, formData[name]) });
    };

    // function to choose appropriate validation function
    const validate = (name, value) => {
        switch (name) {
            case "email":
                return validateEmail(value);
            case "password":
                return validatePassword(value);
            case "confirmPassword":
                return validateConfirmPassword(value, formData.password);
            case "firstName":
                return validateRequired(value, "First name");
            case "lastName":
                return validateRequired(value, "Last name");
            case "location":
                return validateRequired(value, "Location");
            case "dateOfBirth":
                return validateRequired(value, "Date of birth");
            case "initialEmail":
                return validateEmail(value);
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
                setFormData({ ...formData, location: place.formatted_address });
            } else {
                return;
            }
        };
    }, [formData]);

    const Loading = () => {
        return (
            <div>
                <Skeleton className={"w-4 h-4"} />
            </div>
        );
    };

    if (status === "loading" || status === "authenticated") {
        return <Loading />;
    }

    return (
        <>
            <div className="flex flex-col items-start justify-start min-h-screen gap-5 mx-8 pt-10 pb-32">
                <h1 className="font-bold text-3xl">Sign Up</h1>

                {/* form */}
                {stage === "initial" ? (
                    // Initial sign up form
                    <>
                        <form onSubmit={handleInitialSubmit} className="flex flex-col gap-3 w-full">
                            {/* email input */}
                            <AuthInput
                                title="Email"
                                type="email"
                                name="initialEmail"
                                placeholder="john@example.com"
                                value={formData.initialEmail}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.initialEmail}
                                touched={touched.initialEmail}
                            />

                            {/* submit button */}
                            <Button type="submit" disabled={isSubmitting}>
                                Continue&nbsp;&nbsp;&rarr;
                            </Button>
                        </form>

                        {/* Line separator with text */}
                        <div className="relative w-full text-sm">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center">
                                <span className="bg-white px-2 text-gray-500">Or</span>
                            </div>
                        </div>

                        <div className="flex gap-2 w-full">
                            {/* Social Buttons */}
                            <Button
                                className={
                                    "inline-flex items-center gap-2 w-full justify-center rounded-md bg-white px-4 py-2 text-gray-500 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                                }
                                onClick={() => handleSocialClick("google")}
                            >
                                <BsGoogle />
                                Sign Up with Google
                            </Button>
                            {/* Add more social buttons as needed */}
                        </div>
                    </>
                ) : (
                    // Main sign up form
                    <form onSubmit={handleMainSubmit} className="flex flex-col gap-3 w-full">
                        {/* Back button */}
                        <div
                            className="-ml-2 flex items-center gap-1"
                            onClick={() => setStage("initial")}
                        >
                            <IoIosArrowBack className="text-2xl" />
                            <p className="mb-0.5">Back</p>
                        </div>

                        {/* date of birth input */}
                        <div className="flex flex-col">
                            <label className="text-base font-medium text-slate-900 mb-1 ml-0">
                                Date of Birth
                            </label>
                            <DatePickerBirthday
                                formData={formData}
                                setFormData={setFormData}
                                maxDate={new Date()}
                            />
                        </div>

                        {/* first name input */}
                        <AuthInput
                            title="First Name"
                            type="text"
                            name="firstName"
                            placeholder="John"
                            value={formData.firstName}
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
                            value={formData.lastName}
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
                            />
                            {errors.location && touched.location && (
                                <p className="text-sm ml-3 mt-1 text-red-500">{errors.location}</p>
                            )}
                        </div>

                        {/* email input */}
                        <AuthInput
                            title="Email"
                            type="email"
                            name="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.email}
                            touched={touched.email}
                        />

                        {/* password input */}
                        <AuthInput
                            title="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.password}
                            touched={touched.password}
                        />

                        {/* confirm password input */}
                        <AuthInput
                            title="Confirm Password"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.confirmPassword}
                            touched={touched.confirmPassword}
                        />

                        {/* submit button */}
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                "Sign Up"
                            )}
                        </Button>
                    </form>
                )}

                <Link
                    href="/auth/signin"
                    className="self-end mr-2 underline cursor-pointer text-[#61C0BF]"
                >
                    Already have an account? Sign In.
                </Link>
            </div>
            <BottomNav />
        </>
    );
};

export default SignUp;
