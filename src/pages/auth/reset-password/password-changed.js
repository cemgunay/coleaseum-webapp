import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";

const TokenSentPage = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col items-start gap-5 m-8">
            <h1 className="font-bold text-2xl text-center">Password Changed</h1>
            <div>Your password has been successfully changed.</div>
            <Button
                className={"w-full"}
                onClick={() => {
                    router.push("/auth/signin");
                }}
            >
                Sign In
            </Button>
        </div>
    );
};

export default TokenSentPage;
