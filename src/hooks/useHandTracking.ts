'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import {
  HandGestureState,
  NormalizedPoint,
  TrackedHand,
} from '@/types/krathong';

const MEDIAPIPE_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm';
const MEDIAPIPE_FALLBACK_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const HAND_MODEL_ASSET_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const PINCH_ENGAGE_THRESHOLD = 0.065;
const PINCH_RELEASE_THRESHOLD = 0.088;
const CURSOR_SMOOTHING_FACTOR = 0.42;
const MIN_DETECTION_INTERVAL_MS = 32;
const MAX_TRACKED_HANDS = 5;

interface UseHandTrackingOptions {
  enabled: boolean;
}

interface UseHandTrackingReturn {
  videoRef: React.RefCallback<HTMLVideoElement>;
  gestureState: HandGestureState;
  gestureRef: React.RefObject<HandGestureState>;
  retryCamera: () => void;
}

function calculateDistance(a: NormalizedPoint, b: NormalizedPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function interpolatePoint(
  prev: NormalizedPoint | null,
  target: NormalizedPoint,
  factor: number
): NormalizedPoint {
  if (!prev) return target;
  return {
    x: prev.x + (target.x - prev.x) * factor,
    y: prev.y + (target.y - prev.y) * factor,
  };
}

async function createHandLandmarkerInstance(): Promise<HandLandmarker> {
  let vision;
  try {
    vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
  } catch {
    vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_FALLBACK_WASM_URL);
  }

  const sharedOptions = {
    runningMode: 'VIDEO' as const,
    numHands: MAX_TRACKED_HANDS,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  };

  try {
    return await HandLandmarker.createFromOptions(vision, {
      ...sharedOptions,
      baseOptions: {
        modelAssetPath: HAND_MODEL_ASSET_URL,
        delegate: 'GPU',
      },
    });
  } catch {
    return await HandLandmarker.createFromOptions(vision, {
      ...sharedOptions,
      baseOptions: {
        modelAssetPath: HAND_MODEL_ASSET_URL,
        delegate: 'CPU',
      },
    });
  }
}

const INITIAL_GESTURE_STATE: HandGestureState = {
  isReady: false,
  isTracking: false,
  isPinching: false,
  cursor: null,
  thumbTip: null,
  indexTip: null,
  pinchDistance: 1,
  hands: [],
  error: null,
};

export function useHandTracking({
  enabled,
}: UseHandTrackingOptions): UseHandTrackingReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mountedVideosRef = useRef<HTMLVideoElement[]>([]);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const smoothedCursorsRef = useRef<(NormalizedPoint | null)[]>(
    Array(MAX_TRACKED_HANDS).fill(null)
  );
  const isPinchingByHandRef = useRef<boolean[]>(
    Array(MAX_TRACKED_HANDS).fill(false)
  );
  const gestureRef = useRef<HandGestureState>({ ...INITIAL_GESTURE_STATE });
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [gestureState, setGestureState] = useState<HandGestureState>(
    INITIAL_GESTURE_STATE
  );

  const retryCamera = useCallback(() => {
    setReloadTrigger((prev) => prev + 1);
  }, []);

  const bindVideo = useCallback((element: HTMLVideoElement | null) => {
    if (!element) return;
    mountedVideosRef.current = [
      ...mountedVideosRef.current.filter((v) => v !== element),
      element,
    ];
    videoRef.current = element;
    return () => {
      mountedVideosRef.current = mountedVideosRef.current.filter(
        (v) => v !== element
      );
      videoRef.current = mountedVideosRef.current.at(-1) ?? null;
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      return;
    }

    let isMounted = true;
    let activeStream: MediaStream | null = null;
    let lastVideoTime = -1;
    let lastDetectTimestamp = 0;

    async function initializePipeline() {
      try {
        setGestureState((prev) => ({ ...prev, error: null }));

        if (!landmarkerRef.current) {
          const instance = await createHandLandmarkerInstance();
          if (!isMounted) {
            instance.close();
            return;
          }
          landmarkerRef.current = instance;
        }

        if (!isMounted) return;

        activeStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            frameRate: { ideal: 30 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (!isMounted) {
          activeStream.getTracks().forEach((track) => track.stop());
          return;
        }

        const attachStreamToMountedVideos = () => {
          for (const vid of mountedVideosRef.current) {
            if (vid.srcObject !== activeStream) {
              vid.srcObject = activeStream;
              vid.play().catch(() => {});
            }
          }
        };
        attachStreamToMountedVideos();

        gestureRef.current = {
          ...gestureRef.current,
          isReady: true,
          error: null,
        };
        setGestureState((prev) => ({ ...prev, isReady: true, error: null }));

        const detectFrame = (nowMs: number) => {
          if (!isMounted) return;

          attachStreamToMountedVideos();
          const video = videoRef.current;
          const landmarker = landmarkerRef.current;

          if (!video || !landmarker || video.readyState < 2) {
            rafIdRef.current = requestAnimationFrame(detectFrame);
            return;
          }

          if (
            video.currentTime !== lastVideoTime &&
            nowMs - lastDetectTimestamp >= MIN_DETECTION_INTERVAL_MS
          ) {
            lastVideoTime = video.currentTime;
            lastDetectTimestamp = nowMs;

            const result = landmarker.detectForVideo(video, nowMs);
            const rawHands = result.landmarks ?? [];

            if (rawHands.length === 0) {
              const wasTracking = gestureRef.current.isTracking;
              isPinchingByHandRef.current = Array(MAX_TRACKED_HANDS).fill(false);
              smoothedCursorsRef.current = Array(MAX_TRACKED_HANDS).fill(null);
              gestureRef.current = {
                isReady: true,
                isTracking: false,
                isPinching: false,
                cursor: null,
                thumbTip: null,
                indexTip: null,
                pinchDistance: 1,
                hands: [],
                error: null,
              };

              if (wasTracking) {
                setGestureState({ ...gestureRef.current });
              }
            } else {
              const trackedHands: TrackedHand[] = rawHands
                .slice(0, MAX_TRACKED_HANDS)
                .map((landmarks, idx) => {
                  const mirroredLandmarks: NormalizedPoint[] = landmarks.map(
                    (pt) => ({
                      x: 1 - pt.x,
                      y: pt.y,
                    })
                  );

                  const thumbTip = mirroredLandmarks[4];
                  const indexTip = mirroredLandmarks[8];

                  const rawMidpoint: NormalizedPoint = {
                    x: (thumbTip.x + indexTip.x) * 0.5,
                    y: (thumbTip.y + indexTip.y) * 0.5,
                  };

                  const smoothedCursor = interpolatePoint(
                    smoothedCursorsRef.current[idx],
                    rawMidpoint,
                    CURSOR_SMOOTHING_FACTOR
                  );
                  smoothedCursorsRef.current[idx] = smoothedCursor;

                  const distance = calculateDistance(thumbTip, indexTip);
                  const prevPinch = isPinchingByHandRef.current[idx] ?? false;
                  const nextPinch = prevPinch
                    ? distance < PINCH_RELEASE_THRESHOLD
                    : distance < PINCH_ENGAGE_THRESHOLD;

                  isPinchingByHandRef.current[idx] = nextPinch;

                  return {
                    handIndex: idx,
                    isPinching: nextPinch,
                    cursor: smoothedCursor,
                    thumbTip,
                    indexTip,
                    landmarks: mirroredLandmarks,
                  };
                });

              const primary = trackedHands[0];
              const anyPinching = trackedHands.some((h) => h.isPinching);
              const statusChanged =
                !gestureRef.current.isTracking ||
                gestureRef.current.hands.length !== trackedHands.length ||
                gestureRef.current.isPinching !== anyPinching;

              gestureRef.current = {
                isReady: true,
                isTracking: true,
                isPinching: anyPinching,
                cursor: primary.cursor,
                thumbTip: primary.thumbTip,
                indexTip: primary.indexTip,
                pinchDistance: calculateDistance(
                  primary.thumbTip,
                  primary.indexTip
                ),
                hands: trackedHands,
                error: null,
              };

              if (statusChanged) {
                setGestureState({ ...gestureRef.current });
              }
            }
          }

          rafIdRef.current = requestAnimationFrame(detectFrame);
        };

        rafIdRef.current = requestAnimationFrame(detectFrame);
      } catch (err) {
        if (!isMounted) return;
        const message =
          err instanceof Error
            ? err.message
            : 'ไม่สามารถเปิดใช้งานกล้องเว็บแคมได้ กรุณาอนุญาตการเข้าถึงกล้อง';
        gestureRef.current = {
          ...INITIAL_GESTURE_STATE,
          error: message,
        };
        setGestureState({ ...gestureRef.current });
      }
    }

    initializePipeline();

    return () => {
      isMounted = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
      isPinchingByHandRef.current = Array(MAX_TRACKED_HANDS).fill(false);
      smoothedCursorsRef.current = Array(MAX_TRACKED_HANDS).fill(null);
      gestureRef.current = { ...INITIAL_GESTURE_STATE };
      setGestureState(INITIAL_GESTURE_STATE);
    };
  }, [enabled, reloadTrigger]);

  return {
    videoRef: bindVideo,
    gestureState,
    gestureRef,
    retryCamera,
  };
}
