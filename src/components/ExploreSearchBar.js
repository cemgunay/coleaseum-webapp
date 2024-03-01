import { format } from "date-fns";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";

const ExploreSearchBar = ({ setOpenSearch }) => {
    const router = useRouter();
    const { query } = router;

    const [location, setLocation] = useState(
        query.location ? query.location : ""
    );
    const [startDate, setStartDate] = useState(
        query.startDate ? new Date(query.startDate) : ""
    );
    const [endDate, setEndDate] = useState(
        query.endDate ? new Date(query.endDate) : ""
    );

    useEffect(() => {
        if (query.location) {
            setLocation(query.location);
        }
        if (query.startDate) {
            setStartDate(new Date(query.startDate));
        }
        if (query.endDate) {
            setEndDate(new Date(query.endDate));
        }
    }, [query]);

    return (
        <div className="w-5/6 border rounded-lg h-12 py-1 pr-4 pl-3">
            <div className="flex gap-2 items-center">
                <FaMagnifyingGlass />
                <div>
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
            </div>
        </div>
    );
};

export default ExploreSearchBar;
