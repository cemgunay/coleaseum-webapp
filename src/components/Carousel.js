import React from "react";
import Slider from "react-slick";

const Carousel = ({
    slidesToShow,
    dots,
    index,
    from,
    setData,
    data,
    images,
    onClick,
    addMargins,
    setWidth,
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

    const handleOnChange = (currentImage) => {
        if (from === "Collage" && setData) {
            setData({ ...data, i: currentImage });
        }
    };

    return (
        <Slider {...settings} afterChange={handleOnChange}>
            {images.map((element, i) => (
                <img
                    key={i}
                    src={element}
                    alt={`Slide ${i}`}
                    onClick={onClick}
                    className={`${addMargins ? "carousel-image with-margin" : "carousel-image"} ${
                        setWidth ? "set-width" : ""
                    } ${rounded ? "rounded-md" : ""}`}
                />
            ))}
        </Slider>
    );
};

export default Carousel;
