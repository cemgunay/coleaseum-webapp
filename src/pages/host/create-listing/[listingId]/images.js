import CreateListingLayout from "@/components/CreateListingLayout";
import Skeleton from "@/components/Skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { useListingForm } from "@/hooks/useListingForm";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FaEllipsisH } from "react-icons/fa";

import {
    MAX_FILE_SIZE,
    MIN_FILE_SIZE,
    ALLOWED_FILE_TYPES,
    MAX_FILES,
    UPLOAD_TIMEOUT,
} from "@/utils/constants";

const Images = () => {
    //cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    //initialize router
    const router = useRouter();

    //get context from listing form
    const {
        listingId,
        combinedListingFormState,
        combinedListingFormDispatch,
        pushToDatabase,
        setUserBack
    } = useListingForm();

    //initialize files array
    const [files, setFiles] = useState([]);

    // useEffect to sync state with props
    useEffect(() => {
        if (combinedListingFormState.images) {
            setFiles(combinedListingFormState.images);
        }
    }, [combinedListingFormState.images]);

    //initialize upload progress object for each file
    const [uploadProgress, setUploadProgress] = useState({});

    //to check if we can proceed to next page
    const [canGoNext, setCanGoNext] = useState(false);

    //useToast hook
    const { toast } = useToast();

    //function to handle onDrop
    const onDrop = useCallback(
        (acceptedFiles, fileRejections) => {
            // Process accepted files
            acceptedFiles.forEach((file) => {
                //create uniqueId
                const uniqueId = `${file.name}-${Date.now()}-${Math.random()}`;

                //set the files array
                setFiles((prevFiles) => [
                    ...prevFiles,
                    Object.assign(file, {
                        preview: URL.createObjectURL(file),
                        uniqueId: uniqueId,
                    }),
                ]);

                //run the uploadImage for each file
                uploadImage(file);
            });

            // Handle rejected files and give one big toast notification
            let errorMessages = fileRejections.flatMap((rejection) => {
                const fileName = rejection.file.name;
                return rejection.errors.map((error) => {
                    let message = `${fileName}: `;
                    switch (error.code) {
                        case "file-too-large":
                            message += `File is too large. Max size is ${
                                MAX_FILE_SIZE / 1024 / 1024
                            } MB.`;
                            break;
                        case "file-too-small":
                            message += `File is too small. Min size is ${MIN_FILE_SIZE / 1024} KB.`;
                            break;
                        case "file-invalid-type":
                            message += `Invalid file type. Allowed types are ${ALLOWED_FILE_TYPES.join(
                                ", "
                            )}.`;
                            break;
                        default:
                            message += error.message;
                    }
                    return message;
                });
            });

            if (errorMessages.length > 0) {
                toast({
                    variant: "destructive",
                    title: "File Upload Error",
                    description: (
                        <ul>
                            {errorMessages.map((msg, idx) => (
                                <li key={idx} className="mb-2 last:mb-0">
                                    {msg}
                                </li>
                            ))}
                        </ul>
                    ),
                });
            }
        },
        [listingId, toast]
    );

    //useDropzone function that handles when files are dropped into it with limits from constants above
    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "image/*": ALLOWED_FILE_TYPES,
        },
        maxSize: MAX_FILE_SIZE,
        minSize: MIN_FILE_SIZE,
        maxFiles: MAX_FILES,
    });

    //function to upload each image with a 10 second timeout per image
    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "coleaseum_listings");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            removeFilePreview(file.uniqueId); // Function to remove file preview
            toast({
                variant: "destructive",
                title: "Upload Timeout",
                description: "File upload took too long and was cancelled.",
            });
            controller.abort();
        }, UPLOAD_TIMEOUT);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                    signal: controller.signal,
                }
            );

            clearTimeout(timeoutId);
            const data = await response.json();

            if (data.secure_url) {
                updateProgress(file.uniqueId, 100, "success"); // Update progress on successful upload
                updateFileUrl(file.uniqueId, data.secure_url); // Update file with Cloudinary URL
            } else {
                // Handle case where there's no error, but the upload wasn't successful
                console.error("No secure url found");
                updateProgress(file.uniqueId, 0, "Upload failed");
            }
        } catch (error) {
            clearTimeout(timeoutId);
            console.error("Error uploading file:", error);
            if (error.name !== "AbortError") {
                toast({
                    variant: "destructive",
                    title: "Upload Error",
                    description: error.message || "An error occurred during file upload.",
                });
                updateProgress(file.uniqueId, 0, error.message || "Upload error");
            }
        }
    };

    //remove file preview if upload fail
    const removeFilePreview = (uniqueId) => {
        setFiles((currentFiles) => currentFiles.filter((file) => file.uniqueId !== uniqueId));
    };

    //update file state with cloudinaryUrl
    const updateFileUrl = (uniqueId, url) => {
        setFiles((currentFiles) => {
            return currentFiles.map((file) => {
                if (file.uniqueId === uniqueId) {
                    return { ...file, cloudinaryUrl: url };
                }
                return file;
            });
        });
    };

    //update the progress state for each file
    const updateProgress = (uniqueId, progress, status = "") => {
        setUploadProgress((prevProgress) => {
            const newProgress = {
                ...prevProgress,
                [uniqueId]: { progress, status }, // Include status message (success, error message, etc.)
            };
            return newProgress;
        });
    };

    //useEffect to update progress state for each file from database
    useEffect(() => {
        if (combinedListingFormState.images && combinedListingFormState.images.length) {
            setUploadProgress((prevProgress) => {
                // Create a new progress object
                const newProgress = { ...prevProgress };

                // Iterate over the images array
                combinedListingFormState.images.forEach((image) => {
                    // Assuming each image has a uniqueId property
                    if (image.uniqueId) {
                        newProgress[image.uniqueId] = {
                            progress: 100,
                            status: "success",
                        };
                    }
                });

                return newProgress;
            });
        }
    }, [combinedListingFormState.images]);

    //to check if we can go next (only go next if there are minimum 3 uploaded images and none in progress)
    const checkCanGoNext = () => {
        const uploadedImagesCount = files.filter(
            (file) => uploadProgress[file.uniqueId]?.progress === 100
        ).length;

        const isUploadInProgress = Object.values(uploadProgress).some(
            (progress) => progress.progress < 100
        );

        setCanGoNext(uploadedImagesCount >= 3 && !isUploadInProgress);
    };

    //useEffect so that checkCanGoNext runs everytime the files state updates
    useEffect(() => {
        checkCanGoNext();
    }, [files]);

    //function to remove image
    const removeImage = (uniqueId) => {
        setFiles((files) => {
            const newFiles = files.filter((file) => file.uniqueId !== uniqueId);

            return newFiles;
        });
    };

    //function to move image up or down in index of state
    const moveImage = (index, direction) => {
        setFiles((prevFiles) => {
            const newFiles = [...prevFiles];
            if (direction === "up" && index > 0) {
                [newFiles[index], newFiles[index - 1]] = [newFiles[index - 1], newFiles[index]];
            } else if (direction === "down" && index < newFiles.length - 1) {
                [newFiles[index], newFiles[index + 1]] = [newFiles[index + 1], newFiles[index]];
            }

            return newFiles;
        });
    };

    //function to make image number 1 in index of state
    const makeCoverPhoto = (index) => {
        setFiles((prevFiles) => {
            const newFiles = [...prevFiles];
            const [selectedFile] = newFiles.splice(index, 1);
            newFiles.unshift(selectedFile);

            return newFiles;
        });
    };

    //handle submit and push to databse
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Filter out files that are fully uploaded and have Cloudinary URLs
        const uploadedFiles = files.filter(
            (file) => file.cloudinaryUrl && uploadProgress[file.uniqueId]?.progress === 100
        );

        //format data for update
        const updateData = {
            images: uploadedFiles,
        };

        // Push to database
        await pushToDatabase(listingId, updateData, "title");

        //To update the state with files
        combinedListingFormDispatch({
            type: "UPDATE_IMAGES",
            payload: uploadedFiles,
        });
    };

    //handleback
    const handleBack = () => {
        setUserBack(true)
        router.push(`/host/create-listing/${listingId}/amenities`);
    };

    //loading component
    const Loading = () => {
        return (
            <div className="mx-8 mb-4 h-full flex flex-col gap-4">
                <Skeleton className="h-14 w-3/4 mb-2" />
                <div className="grid grid-cols-1 gap-4">
                    {[...Array(4)].map((_, index) => (
                        <Skeleton key={index} className="h-56 w-full" /> // Adjust height as per PropertyTypeOption
                    ))}
                </div>
            </div>
        );
    };

    // image block UI
    const imageBlock = (file, index) => (
        <div
            key={file.uniqueId}
            className="relative inline-flex rounded border border-gray-200 mb-2 mr-2 h-56 box-border w-full overflow-hidden"
        >
            <Image
                src={file.cloudinaryUrl ? file.cloudinaryUrl : file.preview}
                width={500}
                height={500}
                alt="Picture of listing"
                className="object-cover"
                priority
            />

            {/* Gray overlay that appears based on upload progress */}
            {uploadProgress[file.uniqueId]?.progress !== 100 && (
                <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
                    <span className="text-white text-lg">Uploading...</span>
                </div>
            )}

            <div className="absolute top-0 w-full bg-gray-200 h-1 dark:bg-gray-700">
                <div
                    className="bg-color-primary h-1 dark:bg-color-primary"
                    style={{
                        width: `${uploadProgress[file.uniqueId]?.progress || 0}%`,
                    }}
                ></div>
            </div>

            <Popover>
                <PopoverTrigger asChild>
                    <button className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-lg m-2">
                        <FaEllipsisH className="text-black text-sm" /> {/* Black ellipsis icon */}
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto text-sm mr-6">
                    <ul className="flex flex-col">
                        <li
                            onClick={() => makeCoverPhoto(index)}
                            className="border-b pb-1.5 border-gray-200"
                        >
                            Make Cover Photo
                        </li>
                        {index > 0 && (
                            <li
                                onClick={() => moveImage(index, "up")}
                                className="border-b pb-1.5 pt-1 border-gray-200"
                            >
                                Move Up
                            </li>
                        )}
                        {index < files.length - 1 && (
                            <li
                                onClick={() => moveImage(index, "down")}
                                className="border-b pb-1.5 pt-1 border-gray-200"
                            >
                                Move Down
                            </li>
                        )}
                        <li onClick={() => removeImage(file.uniqueId)} className="pt-1">
                            Delete
                        </li>
                    </ul>
                </PopoverContent>
            </Popover>
        </div>
    );

    return (
        <CreateListingLayout
            Loading={Loading}
            currentStep={5}
            totalSteps={10}
            onNext={handleSubmit}
            onBack={handleBack}
            canGoNext={canGoNext}
        >
            <div className="mx-8">
                <div className="flex flex-col gap-2">
                    <div>Add some photos of your apartment</div>
                    <div className="text-sm font-light">
                        You'll need 3 photos to get started. You can add more or make changes later.
                    </div>
                </div>

                {/* Image List */}
                <div className="flex flex-col mt-4">
                    {files.map((file, index) => imageBlock(file, index))}
                </div>

                {/* Dropzone */}
                <div
                    {...getRootProps({
                        className:
                            "p-5 border-2 border-dashed border-color-primary rounded bg-gray-100 text-gray-400 outline-none transition-border duration-200 ease-in-out cursor-pointer my-4",
                    })}
                >
                    <input {...getInputProps()} />
                    <p>
                        Drag 'n' drop some files of type jpg/jpeg/png here, or click to select files
                    </p>
                </div>
            </div>
        </CreateListingLayout>
    );
};

export default Images;
