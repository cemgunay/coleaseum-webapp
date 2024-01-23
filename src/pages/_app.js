import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@/styles/CarouselElement.css";
import AuthProvider from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { PusherProvider } from "@/context/PusherContext";
import { ListingFormProvider } from "@/context/ListingFormContext";

export default function App({ Component, pageProps }) {
    return (
        <AuthProvider>
            <PusherProvider>
                <ListingFormProvider>
                    <Component {...pageProps} />
                    <Toaster />
                </ListingFormProvider>
            </PusherProvider>
        </AuthProvider>
    );
}
