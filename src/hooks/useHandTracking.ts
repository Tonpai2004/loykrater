'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { HandLandmarker } from '@mediapipe/tasks-vision';
import {
  HandGestureState,
  NormalizedPoint,
  TrackedHand,
} from '@/types/krathong';

const MEDIAPIPE_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm';
const MEDIAPIPE_FALLBACK_WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
// Served from our own CDN with a 1-year cache (next.config headers); Google Storage was slow
// (~16 s for 7.8 MB) and only cached for an hour, so it stays only as a fallback
const HAND_MODEL_ASSET_URL = '/models/hand_landmarker.task';
const HAND_MODEL_FALLBACK_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const PINCH_ENGAGE_THRESHOLD = 0.065;
const PINCH_RELEASE_THRESHOLD = 0.088;
const CURSOR_SMOOTHING_FACTOR = 0.42;
const MIN_DETECTION_INTERVAL_MS = 32;
// Detection runs on the main thread next to the river animation; a slow device backs off
// to this interval so the canvas keeps getting frames
const MAX_DETECTION_INTERVAL_MS = 120;
const MAX_TRACKED_HANDS = 5;
// Phones are held by one person, and each extra hand adds a landmark pass per frame
const MAX_TRACKED_HANDS_TOUCH = 2;

export type CameraErrorCode = 'denied' | 'unavailable' | 'tracker' | 'unknown';

function cameraErrorCode(err: unknown): CameraErrorCode {
  const name = err instanceof DOMException ? err.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied';
  if (
    name === 'NotFoundError' ||
    name === 'NotReadableError' ||
    name === 'OverconstrainedError' ||
    typeof navigator === 'undefined' ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return 'unavailable';
  }
  return 'unknown';
}

function isTouchDevice(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
}

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
  // Loaded on demand so the MediaPipe runtime is only fetched once the camera is actually needed
  const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision');
  let vision;
  try {
    vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
  } catch {
    vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_FALLBACK_WASM_URL);
  }

  const sharedOptions = {
    runningMode: 'VIDEO' as const,
    numHands: isTouchDevice() ? MAX_TRACKED_HANDS_TOUCH : MAX_TRACKED_HANDS,
    minHandDetectionConfidence: 0.5,
    minHandPresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  };

  const attempts: { modelAssetPath: string; delegate: 'GPU' | 'CPU' }[] = [
    { modelAssetPath: HAND_MODEL_ASSET_URL, delegate: 'GPU' },
    { modelAssetPath: HAND_MODEL_ASSET_URL, delegate: 'CPU' },
    { modelAssetPath: HAND_MODEL_FALLBACK_URL, delegate: 'CPU' },
  ];
  let lastError: unknown;
  for (const baseOptions of attempts) {
    try {
      return await HandLandmarker.createFromOptions(vision, {
        ...sharedOptions,
        baseOptions,
      });
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

// One landmarker for the whole visit: created on first need, reused when the camera is toggled
let landmarkerPromise: Promise<HandLandmarker> | null = null;

function loadHandLandmarker(): Promise<HandLandmarker> {
  landmarkerPromise ??= createHandLandmarkerInstance().catch((err) => {
    landmarkerPromise = null;
    throw err;
  });
  return landmarkerPromise;
}

let assetsPrefetched = false;

// Warms the HTTP cache with the MediaPipe runtime and hand model (~22 MB) while the visitor is
// still crafting, so the river screen only has to start them. Download only: compiling the
// wasm here would stall the crafting UI on slower phones. Skipped on data-saver connections.
export function prefetchHandTrackingAssets(): void {
  if (assetsPrefetched || typeof window === 'undefined') return;
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection;
  if (connection?.saveData || /2g/.test(connection?.effectiveType ?? '')) return;
  assetsPrefetched = true;

  const drain = async (url: string) => {
    try {
      const res = await fetch(url, { priority: 'low' } as RequestInit);
      const reader = res.body?.getReader();
      if (!reader) return;
      while (!(await reader.read()).done) {
        // Stream to the cache without holding the bytes in memory
      }
    } catch {
      // A failed prefetch only means the river screen downloads it instead
    }
  };
  void drain(`${MEDIAPIPE_WASM_URL}/vision_wasm_internal.js`);
  void drain(`${MEDIAPIPE_WASM_URL}/vision_wasm_internal.wasm`);
  void drain(HAND_MODEL_ASSET_URL);
}

const INITIAL_GESTURE_STATE: HandGestureState = {
  isReady: false,
  trackerReady: false,
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
    let detectionIntervalMs = MIN_DETECTION_INTERVAL_MS;

    const reportError = (code: CameraErrorCode) => {
      gestureRef.current = { ...INITIAL_GESTURE_STATE, error: code };
      setGestureState({ ...gestureRef.current });
    };

    async function initializePipeline() {
      try {
        setGestureState((prev) => ({ ...prev, error: null }));

        // The hand model downloads while the camera opens, so the visitor sees themselves at once
        // instead of staring at a blank box until ~22 MB of MediaPipe has arrived
        const landmarkerReady = landmarkerRef.current
          ? Promise.resolve(landmarkerRef.current)
          : loadHandLandmarker();
        landmarkerReady
          .then((instance) => {
            if (!isMounted) return;
            landmarkerRef.current = instance;
            gestureRef.current = { ...gestureRef.current, trackerReady: true };
            setGestureState((prev) => ({ ...prev, trackerReady: true }));
          })
          .catch(() => {
            if (!isMounted) return;
            // The camera may still be live; keep its preview and just flag the tracker
            gestureRef.current = { ...gestureRef.current, error: 'tracker' };
            setGestureState((prev) => ({ ...prev, error: 'tracker' }));
          });

        if (!navigator.mediaDevices?.getUserMedia) {
          reportError('unavailable');
          return;
        }

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
            nowMs - lastDetectTimestamp >= detectionIntervalMs
          ) {
            lastVideoTime = video.currentTime;
            lastDetectTimestamp = nowMs;

            const detectStart = performance.now();
            const result = landmarker.detectForVideo(video, nowMs);
            // Leave the river at least ~2/3 of the main thread: a 40 ms detection waits 120 ms
            const detectCost = performance.now() - detectStart;
            detectionIntervalMs = Math.min(
              MAX_DETECTION_INTERVAL_MS,
              Math.max(
                MIN_DETECTION_INTERVAL_MS,
                detectionIntervalMs * 0.8 + detectCost * 3 * 0.2
              )
            );
            const rawHands = result.landmarks ?? [];

            if (rawHands.length === 0) {
              const wasTracking = gestureRef.current.isTracking;
              isPinchingByHandRef.current = Array(MAX_TRACKED_HANDS).fill(false);
              smoothedCursorsRef.current = Array(MAX_TRACKED_HANDS).fill(null);
              gestureRef.current = {
                isReady: true,
                trackerReady: true,
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
                trackerReady: true,
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
        reportError(cameraErrorCode(err));
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
