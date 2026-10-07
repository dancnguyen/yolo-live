import { useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { detect, getDetector, type Detection } from './detector';

type Status = 'loading' | 'running' | 'error';

const BOX_COLOR = '#00e676';

function drawDetections(canvas: HTMLCanvasElement, detections: Detection[]) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const scale = canvas.clientWidth > 0 ? canvas.width / canvas.clientWidth : 1;
  const lineWidth = 2 * scale;
  ctx.lineWidth = lineWidth;
  ctx.font = `${Math.round(14 * scale)}px Roboto, sans-serif`;
  ctx.textBaseline = 'top';

  for (const { label, score, box } of detections) {
    const width = box.xmax - box.xmin;
    const height = box.ymax - box.ymin;
    ctx.strokeStyle = BOX_COLOR;
    ctx.strokeRect(box.xmin, box.ymin, width, height);

    const text = `${label} ${(score * 100).toFixed(0)}%`;
    const textHeight = parseInt(ctx.font, 10) + 6;
    const textWidth = ctx.measureText(text).width + 8;
    const textY = box.ymin >= textHeight ? box.ymin - textHeight : box.ymin;
    ctx.fillStyle = BOX_COLOR;
    ctx.fillRect(box.xmin - lineWidth / 2, textY, textWidth, textHeight);
    ctx.fillStyle = '#000';
    ctx.fillText(text, box.xmin + 4, textY + 3);
  }
}

type LiveDetectionProps = {
  filters: string[];
};

export default function LiveDetection({ filters }: LiveDetectionProps) {
  const filtersRef = useRef(filters);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState(4 / 3);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    let stream: MediaStream | null = null;
    let frameId = 0;
    const frameCanvas = document.createElement('canvas');
    const video = videoRef.current!;

    async function start() {
      try {
        const [detector, mediaStream] = await Promise.all([
          getDetector(),
          navigator.mediaDevices.getUserMedia({ video: true, audio: false }),
        ]);
        stream = mediaStream;
        if (cancelled) return;

        video.srcObject = mediaStream;
        await video.play();
        if (cancelled) return;
        if (video.videoWidth > 0 && video.videoHeight > 0) setAspectRatio(video.videoWidth / video.videoHeight);
        setStatus('running');

        const loop = async () => {
          const overlay = overlayRef.current;
          if (cancelled || !overlay) return;
          const { videoWidth, videoHeight } = video;
          if (videoWidth > 0 && videoHeight > 0) {
            frameCanvas.width = overlay.width = videoWidth;
            frameCanvas.height = overlay.height = videoHeight;
            frameCanvas.getContext('2d', { willReadFrequently: true })!.drawImage(video, 0, 0, videoWidth, videoHeight);
            const detections = await detect(detector, frameCanvas);
            if (cancelled) return;
            const activeFilters = filtersRef.current;
            drawDetections(
              overlay,
              activeFilters.length ? detections.filter((d) => activeFilters.includes(d.label)) : detections,
            );
          }
          frameId = requestAnimationFrame(loop);
        };
        loop();
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setStatus('error');
      }
    }

    start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      stream?.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    };
  }, []);

  if (status === 'error') {
    return <Alert severity="error">Could not start live detection: {error}</Alert>;
  }

  return (
    <Box sx={{ flex: 1, minHeight: 0, width: '100%', containerType: 'size', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', width: `min(100cqw, ${100 * aspectRatio}cqh)`, aspectRatio }}>
        <Box
          component="video"
          ref={videoRef}
          muted
          playsInline
          sx={{ display: 'block', width: '100%', height: '100%', borderRadius: 1, bgcolor: 'common.black' }}
        />
        <Box
          component="canvas"
          ref={overlayRef}
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        />
        {status === 'loading' && (
          <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, color: 'common.white' }}>
            <CircularProgress color="inherit" />
            <Typography>Loading YOLO26n and camera…</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
