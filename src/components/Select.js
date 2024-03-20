import React, { forwardRef } from "react";
import ReactSelect from "react-select";

const Select = forwardRef(
    ({ label, value, onChange, options, disabled }, ref) => {
        return (
            <div className="z-[100]">
                <label
                    className="
                    block 
                    text-sm 
                    font-medium 
                    leading-6 
                    text-gray-900
                "
                >
                    {label}
                </label>
                <div className="mt-2">
                    <ReactSelect
                        isDisabled={disabled}
                        value={value}
                        onChange={onChange}
                        isMulti
                        options={options}
                        styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        classNames={{
                            control: () => "text-sm",
                        }}
                        components={{ DropdownIndicator: () => null }}
                    />
                </div>
            </div>
        );
    }
);

export default Select;
