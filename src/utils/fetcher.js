const fetcher = async (url, componentName) => {
    if (componentName) console.log(`Fetching data for ${componentName}`); // Log the component initiating the fetch

    try {
        const response = await fetch(url);
        // If the status code is not in the range 200-299,
        // we still try to parse and throw it.
        if (!response.ok) {
            const error = new Error("An error occurred while fetching the data.");
            // Attach extra info to the error object.
            error.info = await response.json();
            error.status = response.status;
            throw error;
        }

        return await response.json();
    } catch (error) {
        // Log the error or handle it as needed
        console.error("Fetch error:", error);
        throw error; // Rethrow if you want calling code to handle it as well.
    }
};

export default fetcher;
