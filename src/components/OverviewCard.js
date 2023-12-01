import Image from "next/image";

const OverviewCard = ({ number, title, description, image }) => {
    //cloudinary transformations
    const cloudName = "dcytupemt";
    const transformations = "w_150,h_150,c_pad,b_white";
    const transformedImage = `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/coleaseum/${image}`;
    const blurTransform = "w_30,h_30,c_fill,e_blur:1000,q_auto:low";
    const blurDataURL = `https://res.cloudinary.com/${cloudName}/image/upload/${blurTransform}/coleaseum/${image}`;

    // https://res.cloudinary.com/dcytupemt/image/upload/w_30,h_30,c_fill,e_blur:1000,q_auto:low/coleaseum/cmlfwyx1lsgrunkdmxgg.png

    return (
        <div className="w-full flex justify-between items-center gap-4">
            <div className="flex flex-col items-start w-3/4">
                <div className="flex items-center gap-2 font-bold">
                    <div>{number}</div>
                    <div>{title}</div>
                </div>
                <div className="text-sm pl-4">{description}</div>
            </div>
            <div className="relative w-18 h-18">
                <Image
                    src={transformedImage}
                    alt={title}
                    width={80}
                    height={80}
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                />
            </div>
        </div>
    );
};

export default OverviewCard;
