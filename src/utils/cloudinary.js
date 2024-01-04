// Function to apply transformations to a Cloudinary URL
export function transformCloudinaryImage(
    originalUrl,
    transformations,
    blurTransform
) {
    // Extract the base Cloudinary URL and the image identifier
    const baseCloudinaryUrl = originalUrl.split("/image/upload/")[0];
    const imageIdentifier = originalUrl.split("/image/upload/")[1];

    // Construct the transformed image URL
    const transformedImage = `${baseCloudinaryUrl}/image/upload/${transformations}/${imageIdentifier}`;

    // Construct the blurred image URL
    const blurDataURL = `${baseCloudinaryUrl}/image/upload/${blurTransform}/${imageIdentifier}`;

    return {
        transformedImage,
        blurDataURL,
    };
}
