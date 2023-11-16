import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import AuthInput from "@/components/AuthInput";
import Button from "@/components/Button";
import DatePicker from "@/components/DatePicker";
import CircularProgress from "@mui/material/CircularProgress";
import { jwtDecode } from "jwt-decode";
import { useToast } from "@/components/ui/use-toast";

// function to validate email
const validateEmail = (email) => {
    // simple regex for email validation
    const re = /\S+@\S+\.\S+/;
    return re.test(email) ? null : "Invalid email address";
};

// function to validate password
const validatePassword = (password) => {
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

const SignUp = () => {
    const { saveUser } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: new Date(),
        location: "",
        email: "",
        password: "",
        confirmPassword: "",
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
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // handle form input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {
            email: validateEmail(formData.email),
            password: validatePassword(formData.password),
            confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
        };
        setErrors(newErrors);

        const isValid = Object.values(newErrors).every((error) => error === null);
        if (isValid) {
            // proceed with form submission
            try {
                setIsSubmitting(true);

                // call signup API route
                const res = await fetch("/api/auth/signup", {
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
                    const data = await res.json();
                    const user = jwtDecode(data.token).user;
                    console.log(user);
                    toast({
                        variant: "success",
                        title: "Sign up successful.",
                        description: "Welcome!",
                    });
                    saveUser(user);
                    router.push("/profile");
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
            default:
                return null;
        }
    };

    return (
        <>
            <div className="flex flex-col items-start justify-start min-h-screen gap-5 mx-8 pt-10 pb-32">
                <h1 className="font-bold text-3xl">Sign Up</h1>
                <p className="text-lg text-slate-500">Lorem Ipsum.</p>

                {/* form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
                    {/* date of birth input */}
                    <div className="flex flex-col">
                        <label className="text-base font-medium text-slate-900 mb-1 ml-0">
                            Date of Birth
                        </label>
                        <DatePicker formData={formData} setFormData={setFormData} />
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
                    <AuthInput
                        title="Location"
                        type="text"
                        name="location"
                        placeholder="Toronto, ON, Canada"
                        value={formData.location}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.location}
                        touched={touched.location}
                    />

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
                    <Button type="submit">
                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Sign Up"}
                    </Button>
                </form>
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
