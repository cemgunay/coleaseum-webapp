// a simple component that will be used to construct loading components
import { cn } from "@/utils/utils";

const Skeleton = ({ className, ...props }) => {
    return <div className={cn("animate-pulse rounded-md bg-slate-200", className)} {...props} />;
};

export default Skeleton;
