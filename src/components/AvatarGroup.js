import Image from "next/image";
import ProfileImagePlaceholder from "./ProfileImagePlaceholder";

const AvatarGroup = ({ users = [] }) => {

    //take the first three users
    const slicedUsers = users.slice(0, 3);

    //position them in a triangle of avatars
    const positionMap = {
        0: "top-0 left-[12px]",
        1: "bottom-0 left-0",
        2: "bottom-0 right-0",
    };

    return (
        <div className="relative h-11 w-11">
            {slicedUsers.map((user, index) => (
                <div
                    key={user._id}
                    className={`
            absolute
            inline-block 
            rounded-full 
            overflow-hidden
            height="h-5"
            width="w-5"
            ${positionMap[index]}
          `}
                >
                    {user?.profilePicture ? (
                        <Image
                            layout="fill"
                            src={user.profilePicture}
                            alt="Avatar"
                        />
                    ) : (
                        <ProfileImagePlaceholder
                            height="h-5"
                            width="w-5"
                            iconSize="text-xs"
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default AvatarGroup;
