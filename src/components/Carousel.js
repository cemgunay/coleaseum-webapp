import React from "react";
import Slider from "react-slick";

import cn from "classnames";

const Carousel = ({
    slidesToShow,
    dots,
    index,
    images,
    onClick,
    margins,
    padding,
    width,
    height,
    rounded,
}) => {
    const settings = {
        infinite: true,
        speed: 500,
        slidesToShow: slidesToShow ? slidesToShow : 1,
        slidesToScroll: 1,
        arrows: false,
        dots: dots,
        initialSlide: index,
    };

    return (
        <Slider {...settings}>
            {images.map((element, i) => (
                <img
                    key={i}
                    src={element}
                    alt={`Slide ${i}`}
                    onClick={onClick}
                    className={cn(
                        "object-cover", // Common class for all images
                        {
                            [margins]: margins,
                            [padding]: padding,
                            "rounded-md": rounded,
                            [`w-${width}`]: width,
                            [`h-${height}`]: height,
                        }
                    )}
                />
            ))}
        </Slider>
    );
};

export default Carousel;
