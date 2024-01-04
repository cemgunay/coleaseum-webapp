import { Button } from "@/components/ui/button";
import { Router } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const Info = () => {
    const router = useRouter();
    return (
        <>
            <div onClick={router.back}>
                <Button
                    variant="outline"
                    size="lg"
                    className="font-normal text-base text-slate-600"
                >
                    Back
                </Button>
            </div>
            <div>Use Coleaseum</div>
            <div>You could make $XCAD / month</div>
            <div>The above number will be based on our average rent</div>
            <div>Write about everything that theyre getting into</div>
            <div>5% fee and guests will also be charged a fee</div>
            <div>They HAVE to upload government ID upon accepting</div>
            <div>They are acknowledging our stuff by listing a place</div>
            <div>
                They are agreeing to signing our contract when they accept
            </div>
            <div>Other stuff that happens when they list</div>
            <Link href="/host/create-listing/overview">
                <Button
                    variant="outline"
                    size="lg"
                    className="font-normal text-base text-slate-600"
                >
                    Start Coleasing
                </Button>
            </Link>
        </>
    );
};

export default Info;
