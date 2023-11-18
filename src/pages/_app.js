import "@/styles/globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@/styles/CarouselElement.css";
import { PusherProvider } from "@/context/PusherContext";

export default function App({ Component, pageProps }) {
    return <PusherProvider>
    <Component {...pageProps} />
  </PusherProvider>;
}
