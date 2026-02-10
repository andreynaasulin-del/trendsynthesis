// ============================================
// TRENDSYNTHESIS — Client-Side Video Renderer V2
// Enhanced quality capture using multiple fallback strategies
// Works in browser without server-side dependencies
// ============================================

export interface RenderProgress {
  stage: "preparing" | "rendering" | "encoding" | "done";
  progress: number; // 0-100
  currentFrame?: number;
  totalFrames?: number;
  message?: string;
}

export interface RenderResult {
  blob: Blob;
  url: string;
  duration: number;
  format: string;
}

// Quality presets
const QUALITY_PRESETS = {
  high: {
    videoBitsPerSecond: 12_000_000, // 12 Mbps
    audioBitsPerSecond: 192_000,
  },
  medium: {
    videoBitsPerSecond: 8_000_000, // 8 Mbps
    audioBitsPerSecond: 128_000,
  },
  low: {
    videoBitsPerSecond: 4_000_000, // 4 Mbps
    audioBitsPerSecond: 96_000,
  },
};

/**
 * Get the best supported video codec
 */
function getBestCodec(): { mimeType: string; extension: string } {
  const codecs = [
    { mime: "video/webm;codecs=vp9,opus", ext: "webm" },
    { mime: "video/webm;codecs=vp9", ext: "webm" },
    { mime: "video/webm;codecs=vp8,opus", ext: "webm" },
    { mime: "video/webm;codecs=vp8", ext: "webm" },
    { mime: "video/webm", ext: "webm" },
  ];

  for (const codec of codecs) {
    if (MediaRecorder.isTypeSupported(codec.mime)) {
      return { mimeType: codec.mime, extension: codec.ext };
    }
  }

  return { mimeType: "video/webm", extension: "webm" };
}

/**
 * Find all drawable elements inside the Remotion player container
 */
function findDrawableElements(container: HTMLElement): (HTMLVideoElement | HTMLCanvasElement | HTMLImageElement)[] {
  const elements: (HTMLVideoElement | HTMLCanvasElement | HTMLImageElement)[] = [];

  // Remotion renders videos as <video> elements
  const videos = container.querySelectorAll("video");
  videos.forEach(v => elements.push(v));

  // Canvas elements (for effects, overlays)
  const canvases = container.querySelectorAll("canvas");
  canvases.forEach(c => elements.push(c));

  // Images (for static backgrounds)
  const images = container.querySelectorAll("img");
  images.forEach(img => {
    if (img.complete && img.naturalWidth > 0) {
      elements.push(img);
    }
  });

  return elements;
}

/**
 * Enhanced frame capture that composites all layers
 */
function captureFrame(
  ctx: CanvasRenderingContext2D,
  container: HTMLElement,
  width: number,
  height: number
): void {
  // Clear with black background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, width, height);

  // Get container bounds for positioning calculations
  const containerRect = container.getBoundingClientRect();

  // Find and draw all drawable elements in order
  const elements = findDrawableElements(container);

  for (const el of elements) {
    try {
      const elRect = el.getBoundingClientRect();

      // Calculate relative position within container
      const relX = elRect.left - containerRect.left;
      const relY = elRect.top - containerRect.top;

      // Scale factors from container to canvas
      const scaleX = width / containerRect.width;
      const scaleY = height / containerRect.height;

      // Destination position and size on canvas
      const dx = relX * scaleX;
      const dy = relY * scaleY;
      const dw = elRect.width * scaleX;
      const dh = elRect.height * scaleY;

      // Draw element to canvas
      if (el instanceof HTMLVideoElement) {
        if (el.readyState >= 2) {
          ctx.drawImage(el, dx, dy, dw, dh);
        }
      } else if (el instanceof HTMLCanvasElement || el instanceof HTMLImageElement) {
        ctx.drawImage(el, dx, dy, dw, dh);
      }
    } catch {
      // Skip elements that can't be drawn (CORS, etc.)
    }
  }

  // Try to capture text overlays using html2canvas-like approach
  // Draw any absolutely positioned text/div overlays
  const textOverlays = container.querySelectorAll('[style*="position: absolute"], [style*="position:absolute"]');

  for (const overlay of textOverlays) {
    if (overlay instanceof HTMLElement && overlay.textContent) {
      const style = window.getComputedStyle(overlay);
      const rect = overlay.getBoundingClientRect();

      const relX = rect.left - containerRect.left;
      const relY = rect.top - containerRect.top;
      const scaleX = width / containerRect.width;
      const scaleY = height / containerRect.height;

      // Set text styles
      const fontSize = parseFloat(style.fontSize) * scaleX;
      ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
      ctx.fillStyle = style.color;
      ctx.textAlign = style.textAlign as CanvasTextAlign || "left";

      const x = relX * scaleX;
      const y = (relY * scaleY) + fontSize;

      // Handle text stroke if present
      if (style.webkitTextStroke) {
        const strokeMatch = style.webkitTextStroke.match(/(\d+)px\s+(.+)/);
        if (strokeMatch) {
          ctx.strokeStyle = strokeMatch[2];
          ctx.lineWidth = parseFloat(strokeMatch[1]) * scaleX;
          ctx.strokeText(overlay.textContent, x, y);
        }
      }

      ctx.fillText(overlay.textContent, x, y);
    }
  }
}

/**
 * High-quality playback capture using real-time recording
 * Records the player as it plays naturally
 */
export async function capturePlayerPlayback(
  playerRef: {
    play: () => void;
    seekTo: (frame: number) => void;
    pause: () => void;
    getCurrentFrame?: () => number;
  },
  containerEl: HTMLElement,
  options: {
    fps: number;
    durationFrames: number;
    width: number;
    height: number;
    quality?: "high" | "medium" | "low";
    onProgress?: (progress: RenderProgress) => void;
  }
): Promise<RenderResult> {
  const { fps, durationFrames, width, height, onProgress } = options;
  const quality = options.quality || "high";
  const durationMs = (durationFrames / fps) * 1000;

  onProgress?.({
    stage: "preparing",
    progress: 0,
    message: "Initializing renderer..."
  });

  // Create high-quality recording canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", {
    alpha: false,
    desynchronized: true, // Better performance for real-time capture
  })!;

  // Enable image smoothing for better quality
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  // Get best codec
  const { mimeType, extension } = getBestCodec();
  const qualitySettings = QUALITY_PRESETS[quality];

  onProgress?.({
    stage: "preparing",
    progress: 10,
    message: `Using codec: ${mimeType}`
  });

  // Create MediaRecorder with optimal settings
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: qualitySettings.videoBitsPerSecond,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onerror = (e) => {
      console.error("MediaRecorder error:", e);
      reject(new Error("Recording failed"));
    };

    recorder.onstop = () => {
      onProgress?.({
        stage: "encoding",
        progress: 95,
        message: "Finalizing video..."
      });

      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);

      onProgress?.({
        stage: "done",
        progress: 100,
        message: "Complete!"
      });

      resolve({
        blob,
        url,
        duration: durationMs / 1000,
        format: extension
      });
    };

    // Seek to beginning
    playerRef.seekTo(0);

    // Start recording with frequent data collection for smoother encoding
    recorder.start(50); // Collect every 50ms

    onProgress?.({
      stage: "rendering",
      progress: 0,
      message: "Starting capture...",
      currentFrame: 0,
      totalFrames: durationFrames
    });

    // Give player time to seek, then start playback
    setTimeout(() => {
      playerRef.play();
    }, 150);

    // Main capture loop - synced with requestAnimationFrame
    let startTime: number | null = null;
    let framesCaptured = 0;

    const captureLoop = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Capture current frame
      captureFrame(ctx, containerEl, width, height);
      framesCaptured++;

      // Calculate progress
      const progress = Math.min(90, Math.round((elapsed / durationMs) * 90));
      const currentFrame = Math.floor((elapsed / 1000) * fps);

      onProgress?.({
        stage: "rendering",
        progress,
        currentFrame,
        totalFrames: durationFrames,
        message: `Frame ${currentFrame}/${durationFrames}`
      });

      // Continue until we've captured the full duration (+ small buffer)
      if (elapsed < durationMs + 200) {
        requestAnimationFrame(captureLoop);
      } else {
        // Stop recording
        playerRef.pause();

        onProgress?.({
          stage: "encoding",
          progress: 92,
          message: "Encoding video..."
        });

        recorder.stop();
        stream.getTracks().forEach((t) => t.stop());
      }
    };

    // Start the capture loop
    requestAnimationFrame(captureLoop);
  });
}

/**
 * Alternative: Frame-by-frame capture for maximum quality
 * Slower but captures every frame precisely
 */
export async function captureFrameByFrame(
  playerRef: {
    seekTo: (frame: number) => void;
    pause: () => void;
  },
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

  onProgress?.({
    stage: "preparing",
    progress: 0,
    message: "Setting up frame-by-frame capture..."
  });

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false })!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const { mimeType, extension } = getBestCodec();
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: QUALITY_PRESETS.high.videoBitsPerSecond,
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
      resolve({ blob, url, duration: durationFrames / fps, format: extension });
    };

    recorder.start(100);

    // Capture each frame by seeking
    let currentFrame = 0;
    const frameDelay = 1000 / fps; // Time per frame in ms

    const captureNextFrame = () => {
      if (currentFrame >= durationFrames) {
        playerRef.pause();
        recorder.stop();
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      playerRef.seekTo(currentFrame);

      // Wait for seek to complete, then capture
      setTimeout(() => {
        captureFrame(ctx, containerEl, width, height);

        const progress = Math.round((currentFrame / durationFrames) * 100);
        onProgress?.({
          stage: "rendering",
          progress,
          currentFrame,
          totalFrames: durationFrames,
          message: `Capturing frame ${currentFrame}/${durationFrames}`
        });

        currentFrame++;

        // Use requestAnimationFrame for smooth processing
        requestAnimationFrame(captureNextFrame);
      }, frameDelay);
    };

    onProgress?.({ stage: "rendering", progress: 0 });
    captureNextFrame();
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

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
