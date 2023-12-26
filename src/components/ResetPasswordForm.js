import React, { useState } from "react";
import AuthInput from "./AuthInput";
import { useRouter } from "next/router";
import { Button } from "./ui/button";
import { CircularProgress } from "@mui/material";
import { BsChevronLeft } from "react-icons/bs";

// function to validate email
const validateEmail = (email) => {
    if (!email) {
        return "Email is required";
    }
    // simple regex for email validation
    const re = /\S+@\S+\.\S+/;
    return re.test(email) ? null : "Invalid email address";
};

const ResetPasswordForm = () => {
    const [email, setEmail] = useState("");

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({
        email: false,
    });

    const [isSending, setIsSending] = useState(false);

    const router = useRouter();

    const handleSubmit = async () => {
        setIsSending(true);

        // validate form
        const newErrors = {
            email: validateEmail(email),
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
            try {
                const response = await fetch("/api/emails/reset-password", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                });
                const data = await response.json();
                if (response.ok) {
                    router.push("/auth/reset-password/token-sent");
                    localStorage.setItem("email", email);
                } else {
                    setIsSending(false);
                    throw new Error(data.error);
                }
            } catch (error) {
                console.error(error);
                setIsSending(false);
            }
        }
    };

    // function to validate when user leaves an input field
    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: validate(name, email) });
    };

    // function to choose appropriate validation function
    const validate = (name, value) => {
        switch (name) {
            case "email":
                return validateEmail(value);
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-start gap-5 m-8">
            <div className="flex items-center w-full">
                <BsChevronLeft onClick={() => router.push("/auth/signin")} />
                <h1 className="font-bold text-2xl flex-grow text-center">
                    Forgot Password?
                </h1>
            </div>
            <AuthInput
            className={"w-full"}
                title="Email"
                type="email"
                name="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleBlur}
                error={errors.email}
                touched={touched.email}
            />
            <Button className={"w-full"} onClick={handleSubmit} disabled={isSending}>
                {isSending ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    "Request a reset link"
                )}
            </Button>
        </div>
    );
};

export default ResetPasswordForm;
