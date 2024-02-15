import { format } from "date-fns";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ExploreSearchBar = ({ setOpenSearch }) => {
    const router = useRouter();
    const { query } = router;

    const [location, setLocation] = useState(
        query.location ? query.location : ""
    );
    const [startDate, setStartDate] = useState(
        query.from
            ? new Date(query.from)
            : ""
    );
    const [endDate, setEndDate] = useState(
        query.to
            ? new Date(query.to)
            : ""
    );

    useEffect(() => {
        if (query.location) {
            setLocation(query.location);
        }
        if (query.from) {
            setStartDate(new Date(query.from));
        }
        if (query.to) {
            setEndDate(new Date(query.to));
        }
    }, [query]);

    return (
        <div className="w-5/6 border rounded-lg h-12 py-1 px-4">
            <div
                className="text-sm font-bold"
                onClick={() => setOpenSearch(true)}
            >
                {location ? location : "Select location"}
            </div>
            <div className="text-xs font-light">
                {startDate && endDate ? (
                    <div>
                        {format(new Date(startDate), "LLL dd, y")} -{" "}
                        {format(new Date(endDate), "LLL dd, y")}
                    </div>
                ) : (
                    "Select dates"
                )}
            </div>
        </div>
    );
};

export default ExploreSearchBar;
