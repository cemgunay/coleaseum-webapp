const fetcher = async (url) => {
    try {
        const response = await fetch(url);

        if (!response.ok) {
            // Handle HTTP errors
            let errorInfo;
            try {
                // Try to parse error as JSON
                errorInfo = await response.json();
            } catch {
                // If not JSON, use status text
                errorInfo = { message: response.statusText };
            }
            throw new Error(errorInfo.message || "Error fetching data");
        }

        return response.json();
    } catch (error) {
        // Handle network errors
        throw new Error(error.message || "Network error");
    }
};

export default fetcher;
