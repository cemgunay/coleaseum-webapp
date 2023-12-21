export default async function getLoggedInUserDetails(
    contextUser,
    status,
    setError,
    setLoadingUserInfo
) {
    if (status === "authenticated") {
        try {
            const response = await fetch(`/api/users/${contextUser?.id}`);
            if (!response.ok) {
                const error = await response.json().error;
                setError(`Error ${response.status}: ${error}`);
                setLoadingUserInfo(false);
                return;
            }
            const user = await response.json();
            return user;
        } catch (error) {
            setError(error.message ? error.message : error);
        } finally {
            setLoadingUserInfo(false);
        }
    }
}
