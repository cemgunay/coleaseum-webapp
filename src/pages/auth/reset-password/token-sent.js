import Skeleton from "@/components/Skeleton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

//function to shorten email
const obfuscateEmail = (email) => {
    const [name, domain] = email.split("@");
    const obfuscatedName = name.substring(0, 2) + "*".repeat(name.length - 2);
    return `${obfuscatedName}@${domain}`;
};

const TokenSentPage = () => {
    const [obfuscatedEmail, setObfuscatedEmail] = useState(null);

    const router = useRouter();

    useEffect(() => {
        const storedEmail = localStorage.getItem("email");

        if (!storedEmail) {
            // Redirect to sign in page if email is not found in localStorage
            router.push("/auth/signin");
            return;
        }
        setObfuscatedEmail(obfuscateEmail(storedEmail));
    }, [router]);

    const Loading = () => (
        <div>
            <Skeleton className="w-6 h-6" />
        </div>
    );

    if (!obfuscatedEmail) {
        return <Loading />;
    }

    return (
        <div className="flex flex-col items-start justify-start gap-5 mx-8 pt-10 pb-32">
            <h1 className="font-bold text-2xl">Email Sent</h1>
            <div>
                We sent an email to{" "}
                <span className="cursor-pointer text-[#61C0BF]">
                    {obfuscatedEmail}
                </span>{" "}
                with a link to reset your password. Please follow instructions
                in email.
            </div>
            <div className="flex flex-col gap-2 w-full justify-end text-xs">
                <Link
                    href="/auth/reset-password"
                    className="self-end mr-2 underline cursor-pointer text-[#61C0BF]"
                >
                    Didn't get an email?
                </Link>
                <Link
                    href="/auth/signin"
                    className="self-end mr-2 underline cursor-pointer text-[#61C0BF]"
                >
                    Already have an account? Sign In
                </Link>
            </div>
        </div>
    );
};

export default TokenSentPage;
