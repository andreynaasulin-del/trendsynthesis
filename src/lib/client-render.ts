// ============================================
// TRENDSYNTHESIS — Client-Side Video Renderer
// Uses Remotion Player canvas capture + MediaRecorder
// Works in browser without server-side dependencies
// ============================================

export interface RenderProgress {
  stage: "preparing" | "rendering" | "encoding" | "done";
  progress: number; // 0-100
  currentFrame?: number;
  totalFrames?: number;
}

export interface RenderResult {
  blob: Blob;
  url: string;
  duration: number;
}

/**
 * Renders a video by recording the Remotion Player's canvas output
 * using MediaRecorder API.
 *
 * How it works:
 * 1. Finds the canvas/video elements inside the Player container
 * 2. Creates a composite canvas at the target resolution
 * 3. Plays the composition from start to end
 * 4. Records the canvas output using MediaRecorder
 * 5. Returns the recorded blob as a downloadable MP4/WebM
 */
export async function renderVideoFromPlayer(
  playerContainer: HTMLElement,
  options: {
    fps: number;
    durationFrames: number;
    width: number;
    height: number;
    onProgress?: (progress: RenderProgress) => void;
  }
): Promise<RenderResult> {
  const { fps, durationFrames, width, height, onProgress } = options;
  const durationSeconds = durationFrames / fps;

  onProgress?.({ stage: "preparing", progress: 0 });

  // Find the player's internal container
  const playerEl = playerContainer.querySelector("video, canvas") as
    | HTMLVideoElement
    | HTMLCanvasElement
    | null;

  if (!playerEl) {
    throw new Error("Could not find video/canvas element in player");
  }

  // Create a recording canvas at target resolution
  const recordCanvas = document.createElement("canvas");
  recordCanvas.width = width;
  recordCanvas.height = height;
  const ctx = recordCanvas.getContext("2d")!;

  // Determine MIME type - prefer webm (broader MediaRecorder support)
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
    ? "video/webm;codecs=vp8"
    : "video/webm";

  // Set up MediaRecorder on the canvas stream
  const stream = recordCanvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8_000_000, // 8 Mbps for good quality
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise<RenderResult>((resolve, reject) => {
    recorder.onerror = (e) => reject(new Error("Recording failed"));

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      onProgress?.({ stage: "done", progress: 100 });
      resolve({ blob, url, duration: durationSeconds });
    };

    recorder.start(100); // Collect data every 100ms
    onProgress?.({ stage: "rendering", progress: 0 });

    // Capture frames by drawing the player content to our canvas
    let frameCount = 0;
    const totalFrames = durationFrames;
    const frameInterval = 1000 / fps;

    const captureFrame = () => {
      if (frameCount >= totalFrames) {
        recorder.stop();
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      try {
        // Draw the current player frame to our recording canvas
        const sourceEl = playerContainer.querySelector(
          "video, canvas, iframe"
        ) as HTMLElement | null;

        if (sourceEl) {
          if (sourceEl instanceof HTMLVideoElement) {
            ctx.drawImage(sourceEl, 0, 0, width, height);
          } else if (sourceEl instanceof HTMLCanvasElement) {
            ctx.drawImage(sourceEl, 0, 0, width, height);
          } else {
            // Fallback: try to draw the container itself
            // Draw a black frame
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, width, height);
          }
        }
      } catch {
        // CORS or other issue - draw black frame
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);
      }

      frameCount++;
      const progress = Math.round((frameCount / totalFrames) * 100);
      onProgress?.({
        stage: "rendering",
        progress,
        currentFrame: frameCount,
        totalFrames,
      });

      requestAnimationFrame(captureFrame);
    };

    // Start capture
    requestAnimationFrame(captureFrame);
  });
}

/**
 * Simpler approach: Capture the player by playing it and recording the screen region.
 * This uses the player's own playback to capture the output.
 */
export async function capturePlayerPlayback(
  playerRef: { play: () => void; seekTo: (frame: number) => void; pause: () => void },
  containerEl: HTMLElement,
  options: {
    fps: number;
    durationFrames: number;
    width: number;
    height: number;
    onProgress?: (progress: RenderProgress) => void;
  }
): Promise<RenderResult> {
  const { fps, durationFrames, width, height, onProgress } = options;
  const durationMs = (durationFrames / fps) * 1000;

  onProgress?.({ stage: "preparing", progress: 0 });

  // Create a canvas to capture from
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Try to find the actual rendering surface
  const findRenderSurface = (): HTMLVideoElement | HTMLCanvasElement | null => {
    // The Remotion Player renders into a container div
    // Look for video elements (OffthreadVideo renders as <video>)
    const videos = containerEl.querySelectorAll("video");
    if (videos.length > 0) return videos[0];

    const canvases = containerEl.querySelectorAll("canvas");
    if (canvases.length > 0) return canvases[0];

    return null;
  };

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 8_000_000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onerror = () => reject(new Error("Recording failed"));

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      onProgress?.({ stage: "done", progress: 100 });
      resolve({ blob, url, duration: durationMs / 1000 });
    };

    // Seek to beginning and start
    playerRef.seekTo(0);
    recorder.start(100);
    onProgress?.({ stage: "rendering", progress: 0 });

    // Start playback
    setTimeout(() => playerRef.play(), 100);

    // Capture loop
    let startTime: number | null = null;
    const captureLoop = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Draw the current state of all visible elements
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);

      const surface = findRenderSurface();
      if (surface) {
        try {
          ctx.drawImage(surface, 0, 0, width, height);
        } catch {
          // CORS issue — skip frame
        }
      }

      const progress = Math.min(100, Math.round((elapsed / durationMs) * 100));
      onProgress?.({
        stage: "rendering",
        progress,
        currentFrame: Math.floor((elapsed / 1000) * fps),
        totalFrames: durationFrames,
      });

      if (elapsed < durationMs + 500) {
        requestAnimationFrame(captureLoop);
      } else {
        playerRef.pause();
        recorder.stop();
        stream.getTracks().forEach((t) => t.stop());
      }
    };

    requestAnimationFrame(captureLoop);
  });
}

/**
 * Download a blob as a file
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
