import Image from "next/image";

const OverviewCard = ({ number, title, description, image }) => {
    //cloudinary transformations
    const cloudName = "dcytupemt";
    const transformations = "w_200,h_200,c_pad,b_white";
    const transformedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${image}`;
    const blurTransform = "w_30,h_30,c_fill,e_blur:1000,q_auto:low";
    const blurDataURL = `https://res.cloudinary.com/${cloudName}/image/upload/${blurTransform}/${image}`;

    return (
        <div className="w-full flex justify-between items-center gap-4">
            <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                    <div>{number}</div>
                    <div>{title}</div>
                </div>
                <div className="text-xs pl-4">{description}</div>
            </div>
            <div className="relative w-18 h-18">
                <Image
                    src={transformedImage}
                    alt={title}
                    width={100}
                    height={100}
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                />
            </div>
        </div>
    );
};

export default OverviewCard;
