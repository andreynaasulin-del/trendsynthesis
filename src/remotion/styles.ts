import { loadFont } from "@remotion/google-fonts/Unbounded";
import { loadFont as loadMono } from "@remotion/google-fonts/RobotoMono";

const { fontFamily: unbounded } = loadFont();
const { fontFamily: robotoMono } = loadMono();

export const styles = {
    fonts: {
        heading: unbounded,
        body: robotoMono,
    },
    colors: {
        primary: "#EAEAEA",
        secondary: "#A3A3A3",
        accent: "#6366f1", // Indigo
    },
    heading: {
        fontFamily: unbounded,
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
