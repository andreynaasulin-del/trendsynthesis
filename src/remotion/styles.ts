import { loadFont } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadMono } from "@remotion/google-fonts/RobotoMono";

const { fontFamily: montserrat } = loadFont();
const { fontFamily: robotoMono } = loadMono();

export const styles = {
    fonts: {
        heading: montserrat,
        body: robotoMono,
    },
    colors: {
        primary: "#EAEAEA",
        secondary: "#A3A3A3",
        accent: "#6366f1", // Indigo
    },
    heading: {
        fontFamily: montserrat,
        fontWeight: 900,
        textTransform: 'uppercase' as const,
    },
    body: {
        fontFamily: robotoMono,
    },
    gradientText: {
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
    }
};
