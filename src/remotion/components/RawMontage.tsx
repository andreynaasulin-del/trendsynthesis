import React from 'react';
import { AbsoluteFill, Sequence, Video, Audio } from 'remotion';

export interface RawMontageProps {
    assets: string[];
    clipDurationInSeconds?: number;
}

export const RawMontage: React.FC<RawMontageProps> = ({
    assets,
    clipDurationInSeconds = 5
}) => {
    const fps = 30;
    const clipDurationFrames = clipDurationInSeconds * fps;

    if (!assets || assets.length === 0) {
        return (
            <AbsoluteFill style={{ backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
                <h1 style={{ color: 'white', fontFamily: 'sans-serif' }}>NO SOURCE ASSETS LOADED</h1>
            </AbsoluteFill>
        );
    }

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {assets.map((src, index) => (
                <Sequence
                    key={index}
                    from={index * clipDurationFrames}
                    durationInFrames={clipDurationFrames}
                >
                    <Video
                        src={src}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                </Sequence>
            ))}
        </AbsoluteFill>
    );
};
