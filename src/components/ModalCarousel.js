import React, { useState } from "react";
import Slider from "react-slick";
import { FaChevronLeft } from "react-icons/fa6";

const ModalCarousel = ({ images, initialSlide, onClose }) => {
    // state
    const [currentSlide, setCurrentSlide] = useState(initialSlide);

    // settings for slider
    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        initialSlide: initialSlide,
        dots: true,
        arrows: false,
        adaptiveHeight: true,
        afterChange: (current) => setCurrentSlide(current),
    };

    // function to stop propagation of click event
    // this will stop the modal from closing when clicking on the slider
    const handleSliderClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            className="flex items-center justify-center fixed inset-0 bg-gray-300 z-50"
            onClick={onClose}
        >
            <div className="absolute top-4 left-4 z-10" onClick={onClose}>
                <FaChevronLeft className="text-2xl text-black cursor-pointer" />
            </div>
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-black">
                {currentSlide + 1}/{images.length}
            </div>
            <div className="relative max-w-3xl w-full" onClick={handleSliderClick}>
                <Slider {...settings}>
                    {images.map((image, index) => (
                        <div key={index}>
                            <img src={image} alt={`Image ${index + 1}`} />
                        </div>
                    ))}
                </Slider>
            </div>
        </div>
    );
};

export default ModalCarousel;
