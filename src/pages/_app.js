import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@/styles/CarouselElement.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { PusherProvider } from "@/context/PusherContext";

export default function App({ Component, pageProps }) {
    return (
        <AuthProvider>
            <PusherProvider>
                <Component {...pageProps} />
                <Toaster />
            </PusherProvider>
        </AuthProvider>
    );
}
