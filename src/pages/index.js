import Image from "next/image";
import { Inter } from "next/font/google";
import ListingList from "@/components/ListingList";

const inter = Inter({ subsets: ["latin"] });

export default function Explore() {
    // const currentUser = null;
    const currentUser = {
        firstName: "Nathan",
    };

    const listings = [
        {
            id: 1,
            title: "Test 007",
            address: "211 Donlea Dr, Toronto, ON",
            location: {
                address1: "211 Donlea Dr",
                city: "Toronto",
                stateprovince: "ON",
            },
            price: 100,
        },
        {
            id: 2,
            title: "Cem's House",
            address: "211 Donlea Dr, Toronto, ON",
            location: {
                address1: "211 Donlea Dr",
                city: "Toronto",
                stateprovince: "ON",
            },
            price: 325,
        },
        {
            id: 3,
            title: "Icon Apartment",
            address: "330 Phillip St, Waterloo, ON",
            location: {
                address1: "330 Phillip St",
                city: "Waterloo",
                stateprovince: "ON",
            },
            price: 125,
        },
    ];

    return (
        <main
            // className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
            className="m-[2rem] min-h-screen flex flex-col gap-2"
        >
            <h1 className="font-bold text-3xl">All listings</h1>
            {currentUser ? <div>Welcome back {currentUser.firstName}</div> : null}
            <p>{listings.length} listings</p>
            <ListingList listings={listings} />
        </main>
    );
}
