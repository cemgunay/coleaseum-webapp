import Skeleton from "@/components/Skeleton";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePusher } from "@/hooks/usePusher";
import { useRouter } from "next/router";

//function to shorten email
const obfuscateEmail = (email) => {
    const [name, domain] = email.split("@");
    const obfuscatedName = name.substring(0, 2) + "*".repeat(name.length - 2);
    return `${obfuscatedName}@${domain}`;
};

const VerificationPage = () => {
    const { toast } = useToast();
    const [email, setEmail] = useState(null);
    const [obfuscatedEmail, setObfuscatedEmail] = useState(null);
    const [cooldown, setCooldown] = useState(0);

    const router = useRouter();

    // get pusher context
    const pusher = usePusher();

    useEffect(() => {
        const storedEmail = localStorage.getItem("email");

        if (!storedEmail) {
            // Redirect to sign in page if email is not found in localStorage
            router.push("/auth/signin");
            return;
        }

        setEmail(storedEmail);
        setObfuscatedEmail(obfuscateEmail(storedEmail));

        const interval = setInterval(() => {
            setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
    }, [router]);

    useEffect(() => {
        // check if pusher is initialized
        if (pusher) {
            //check if already subscribed
            if (!pusher.channel("verify-email")) {
                // Subscribe to the channel
                const channel = pusher.subscribe("verify-email");

                channel.bind("pusher:subscription_succeeded", () => {
                    console.log("subscribed!");

                    // Bind to bid create events
                    channel.bind("email-verified", (data) => {
                        if (data.verified) {
                            router.push("/auth/signin");
                        }
                    });
                });
            }

            // Unbind all events and unsubscribe when component unmounts if subscribed
            return () => {
                const channel = pusher.channel("verify-email");
                const subscribed = channel?.subscribed;
                if (subscribed) {
                    channel.unbind();
                    pusher.unsubscribe("verify-email");
                    console.log("unsubscribed!");
                }
            };
        }
    }, [pusher]);

    const handleResendEmail = async () => {
        if (cooldown === 0 && email) {
            setCooldown(60); // Set cooldown immediately when clicked

            try {
                const response = await fetch("/api/emails/send", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email }),
                });
                const data = await response.json();
                if (response.ok) {
                    console.log("Email sent successfully:", data.message);
                    toast({
                        variant: "success",
                        title: "Email sent successfully",
                        description: data.message,
                    });
                } else {
                    console.error("Failed to send email:", data.error);
                    toast({
                        variant: "destructive",
                        title: "Email failed to send",
                        description: data.error,
                    });
                    setCooldown(0); // Reset cooldown in case of error
                }
            } catch (error) {
                console.error("Error in sending email:", error);
                toast({
                    variant: "destructive",
                    title: "Error in sending email",
                    description: error.toString(),
                });
                setCooldown(0); // Reset cooldown in case of error
            }
        }
    };

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
            <h1 className="font-bold text-2xl">Verify your email address</h1>
            <div>
                Almost there! An email containing verification instructions was
                sent to{" "}
                <span className="cursor-pointer text-[#61C0BF]">
                    {obfuscatedEmail}
                </span>
            </div>
            <div className="flex flex-col gap-2 w-full justify-end text-xs">
                <div className="flex gap-2 w-full justify-end">
                    <div>Didn't receieve the email?</div>
                    <div
                        onClick={handleResendEmail}
                        className={`self-end mr-2 underline cursor-pointer text-[#61C0BF] ${
                            cooldown > 0 ? "text-gray-500" : ""
                        }`}
                    >
                        {cooldown > 0
                            ? `Resend email (${cooldown}s)`
                            : "Resend email"}
                    </div>
                </div>
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

export default VerificationPage;
