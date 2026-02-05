export const styles = {
    heading: {
        fontFamily: '"Montserrat", sans-serif',
        fontWeight: 900,
        textTransform: 'uppercase' as const,
    },
    body: {
        fontFamily: '"Roboto Mono", monospace',
    },
    gradientText: {
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)',
    }
}
