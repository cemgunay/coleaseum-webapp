//HANDLE ERRORS BETTER, leaving like this for now for testing

export async function getListingsInProgress(userId) {
    const response = await fetch(
        `/api/listings/listingsInProgress?userId=${userId}`
    );
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    const data = await response.json()
    console.log(data)
    return data;
}

export async function getListingsCompleted(userId) {
    const response = await fetch(
        `/api/listings/listingsCompleted?userId=${userId}`
    );
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}

export async function getListingsBooked(userId) {
    const response = await fetch(
        `/api/listings/listingsBooked?userId=${userId}`
    );
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}
