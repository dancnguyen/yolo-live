import { pipeline, RawImage, type ObjectDetectionPipeline } from '@huggingface/transformers';

export const MODEL_ID = 'onnx-community/yolo26n-ONNX';

export const LABELS = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat', 'traffic light',
  'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog', 'horse', 'sheep', 'cow',
  'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
  'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
  'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
  'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch', 'potted plant', 'bed',
  'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven',
  'toaster', 'sink', 'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush',
];

export const SCORE_THRESHOLD = 0.25;

export type Detection = {
  label: string;
  score: number;
  box: { xmin: number; ymin: number; xmax: number; ymax: number };
};

let detectorPromise: Promise<ObjectDetectionPipeline> | null = null;

async function hasWebGPU(): Promise<boolean> {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu;
  try {
    return !!(await gpu?.requestAdapter());
  } catch {
    return false;
  }
}

async function createDetector(): Promise<ObjectDetectionPipeline> {
  const device = (await hasWebGPU()) ? 'webgpu' : 'wasm';
  const detector = (await pipeline('object-detection', MODEL_ID, {
    device,
    dtype: 'fp32',
  })) as ObjectDetectionPipeline;

  const imageProcessor = detector.processor.image_processor as unknown as {
    post_process_object_detection: (...args: unknown[]) => unknown;
  };
  const postProcess = imageProcessor.post_process_object_detection.bind(imageProcessor);
  imageProcessor.post_process_object_detection = (outputs, threshold, targetSizes) =>
    postProcess(outputs, threshold, targetSizes, true);

  return detector;
}

export function getDetector(): Promise<ObjectDetectionPipeline> {
  detectorPromise ??= createDetector().catch((error) => {
    detectorPromise = null;
    throw error;
  });
  return detectorPromise;
}

export async function detect(
  detector: ObjectDetectionPipeline,
  canvas: HTMLCanvasElement,
): Promise<Detection[]> {
  const image = RawImage.fromCanvas(canvas);
  return (await detector(image, { threshold: SCORE_THRESHOLD })) as Detection[];
}
