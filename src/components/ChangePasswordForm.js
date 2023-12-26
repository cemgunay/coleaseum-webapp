import React, { useState } from "react";
import AuthInput from "./AuthInput";
import { Button } from "./ui/button";
import { CircularProgress } from "@mui/material";
import { useRouter } from "next/router";

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

const ChangePasswordForm = ({ resetPasswordToken }) => {
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({
        password: false,
        confirmPassword: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        // validate form
        const newErrors = {
            password: validatePassword(password),
            confirmPassword: validateConfirmPassword(confirmPassword, password),
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

        setIsSubmitting(true);

        if (isValid) {
            try {
                const response = await fetch("/api/emails/change-password", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token: resetPasswordToken,
                        password: password,
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    await router.push("/auth/reset-password/password-changed");
                } else {
                    throw new Error(data.error || "An error occurred");
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // function to validate when user leaves an input field
    const handleBlur = (e) => {
        const { name, value } = e.target;
        let error;
        if (name === "password") {
            error = validatePassword(value);
        } else if (name === "confirmPassword") {
            error = validateConfirmPassword(value, password);
        }

        setTouched({ ...touched, [name]: true });
        setErrors({ ...errors, [name]: error });
    };

    return (
        <div className="flex flex-col items-start gap-5 m-8">
            <h1 className="font-bold text-2xl text-center">Reset Password</h1>
            <div className="w-full flex flex-col gap-4">
                <AuthInput
                    title="New Password"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={handleBlur}
                    error={errors.password}
                    touched={touched.password}
                />
                <AuthInput
                    title="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={handleBlur}
                    error={errors.confirmPassword}
                    touched={touched.confirmPassword}
                />
            </div>

            <Button className={"w-full"} onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                    <CircularProgress size={24} color="inherit" />
                ) : (
                    "Change password"
                )}
            </Button>
        </div>
    );
};

export default ChangePasswordForm;
