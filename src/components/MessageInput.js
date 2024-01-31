import Input from "./Input";

const MessageInput = ({
    placeholder,
    id,
    type = "text", // Assuming 'text' as default type
    required,
    register,
}) => {
    return (
        <div className="relative w-full">
            <Input
                id={id}
                type={type}
                autoComplete={id}
                {...register(id, { required })}
                placeholder={placeholder}
                className="
            text-black
            font-light
            py-2
            px-4
            bg-neutral-100 
            w-full 
            rounded-full
            focus:outline-none
          "
            />
        </div>
    );
};

export default MessageInput;
