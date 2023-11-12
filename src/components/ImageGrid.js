import React from "react";
import { FaChevronLeft } from "react-icons/fa6";

const ImageGrid = ({ images, onImageSelect, onClose }) => {
    return (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
            <div className="absolute top-0 left-0 w-fit z-[100] p-4" onClick={onClose}>
                <FaChevronLeft className="text-2xl text-black cursor-pointer" />
            </div>
            <div className="grid grid-cols-2 gap-2 p-4 mt-10">
                {images.map((image, index) => (
                    <img
                        key={index}
                        src={image}
                        alt={`Image ${index + 1}`}
                        onClick={() => onImageSelect(index)}
                        className="grid-image"
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageGrid;
