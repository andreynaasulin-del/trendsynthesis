import React from 'react';
import { Composition, useCurrentFrame, useVideoConfig, spring, interpolate, AbsoluteFill, staticFile, Img, Sequence, OffthreadVideo } from 'remotion';
import { loadFont } from "@remotion/google-fonts/Roboto";

const { fontFamily } = loadFont();

// ============================================================
// TALENTR WHATSAPP AD V2 - CLEAN & MINIMAL
// Focus on background video + floating message bubbles
// ============================================================

// Styles for the glassmorphism bubble
const bubbleStyle: React.CSSProperties = {
    alignSelf: 'center',
    width: 'fit-content',
    maxWidth: '85%',
    backgroundColor: '#DCF8C6', // WhatsApp Green
    padding: '18px 24px',
    borderRadius: '20px',
    marginBottom: 20,
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    position: 'relative',
    borderBottomRightRadius: '4px', // Tail effect
};

// Message Component
const MessageItem: React.FC<{ text: string; index: number; totalMessages: number; delay: number }> = ({ text, index, totalMessages, delay }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const localFrame = frame - delay;

    if (localFrame < 0) return null;

    // Pop in animation
    const scale = spring({
        frame: localFrame,
        fps,
        config: { stiffness: 300, damping: 20 }
    });

    const opacity = interpolate(localFrame, [0, 10], [0, 1]);

    // Slide up logic: as new messages appear, older ones move up
    // We calculate "how many messages came after me"
    // frame > next_message_delay means the next message is visible

    // Hardcoded offsets based on message timing
    const moveUpStep = 150; // Pixels to move up per new message

    // Delays of subsequent messages: 150, 330, 510, 660
    const delays = [60, 150, 330, 510, 660];
    let yOffset = 0;

    delays.forEach(d => {
        if (d > delay && frame > d) {
            const progress = spring({ frame: frame - d, fps, config: { stiffness: 200, damping: 20 } });
            yOffset -= moveUpStep * progress;
        }
    });

    return (
        <div style={{
            ...bubbleStyle,
            opacity,
            transform: `translateY(${yOffset}px) scale(${scale})`,
            position: 'absolute',
            bottom: 300, // Start position near bottom
            right: 40, // Aligned right like sent messages
        }}>
            <div style={{
                fontFamily,
                fontSize: 34,
                fontWeight: 500,
                color: '#000',
                lineHeight: 1.3,
            }}>
                {text}
            </div>
            {/* Tail */}
            <div style={{
                position: 'absolute',
                right: -10,
                bottom: 0,
                width: 0,
                height: 0,
                borderLeft: '12px solid #DCF8C6',
                borderTop: '12px solid transparent',
            }} />
        </div>
    );
};

const TalentrWhatsAppAd: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Background switching (every 7.5s = 225 frames)
    const bgVideos = [
        'bg_fashion.mp4',
        'bg_dj.mp4',
        'bg_artist.mp4',
        'bg_videographer.mp4',
    ];

    const messages = [
        { text: "привет, я заметил тебя в группе творческих людей Израиля на фэйсбуке 👋", delay: 60 },
        { text: "мы сейчас продвигаем наш event-marketplace \"Talentr\", это как «uber» для творческих людей", delay: 150 },
        { text: "у нас работает встроенный AI-Matching, это полностью меняет правила игры 🤖", delay: 330 },
        { text: "Мы сейчас калибруем алгоритм на сильных талантов, это абсолютно бесплатно ✨", delay: 510 },
        { text: "пришли почту я закину инвайт, также мы подарим тебе premium профиль 👍🏼", delay: 660 },
    ];

    // Finale
    const showFinale = frame >= 840;
    const opacity = showFinale ? interpolate(frame, [840, 860], [0, 1]) : 0;

    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>

            {/* LAYER 1: VIVID BACKGROUNDS (No Blur) */}
            {bgVideos.map((video, i) => (
                <Sequence key={video} from={i * 225} durationInFrames={225}>
                    <AbsoluteFill>
                        <OffthreadVideo
                            src={staticFile(video)}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: 'brightness(0.7)', // Slightly dark for text readability, but clear
                            }}
                            muted
                        />
                    </AbsoluteFill>
                </Sequence>
            ))}

            {/* LAYER 2: CHAT STRIP (Floating Bubbles) */}
            {/* We place a container at the bottom right */}
            <AbsoluteFill style={{
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                paddingBottom: 100, // Safe area
            }}>
                <div style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    display: showFinale ? 'none' : 'block' // Hide chat on finale
                }}>
                    {messages.map((msg, i) => (
                        <MessageItem
                            key={i}
                            text={msg.text}
                            index={i}
                            totalMessages={messages.length}
                            delay={msg.delay}
                        />
                    ))}
                </div>
            </AbsoluteFill>

            {/* LAYER 3: LOGO FINALE */}
            <AbsoluteFill style={{
                opacity,
                backgroundColor: 'rgba(0,0,0,0.85)',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Img
                    src={staticFile("talentr-logo.png")}
                    style={{
                        width: 500, // Bigger logo
                        objectFit: 'contain',
                        marginBottom: 50,
                        transform: `scale(${spring({ frame: frame - 840, fps, config: { stiffness: 100 } })})`
                    }}
                />
                <div style={{
                    fontFamily,
                    fontSize: 60,
                    fontWeight: 900,
                    color: 'white',
                    textTransform: 'uppercase',
                    marginTop: 20,
                    letterSpacing: 4,
                }}>
                    ЖДУ ТВОЙ ОТВЕТ
                </div>
            </AbsoluteFill>

        </AbsoluteFill>
    );
};

export const RemotionRoot: React.FC = () => {
    return (
        <Composition
            id="TalentrWhatsAppMinimal"
            component={TalentrWhatsAppAd}
            durationInFrames={900}
            fps={30}
            width={1080}
            height={1920}
        />
    );
};
