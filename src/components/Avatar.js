import Image from "next/image";
import ProfileImagePlaceholder from "./ProfileImagePlaceholder";
import clsx from "clsx";

const Avatar = ({
    user,
    className,
    placeholderHeight,
    placeholderWidth,
    placeholderIconSize,
}) => {
    return (
        <div
            className={clsx(
                "relative inline-block rounded-full h-11 w-11",
                className
            )}
        >
            {user?.profilePicture ? (
                <Image layout="fill" src={user.profilePicture} alt="Avatar" />
            ) : (
                <ProfileImagePlaceholder
                    height={clsx("h-11", placeholderHeight)}
                    width={clsx("w-11", placeholderWidth)}
                    iconSize={clsx("text-2xl", placeholderIconSize)}
                />
            )}
        </div>
    );
};

export default Avatar;
