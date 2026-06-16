"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import styles from "./CameraCapture.module.css";

export default function CameraCapture({ onCapture }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [compressing, setCompressing] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);

    try {
      // Compress to <1MB for fast API calls
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      });

      // Create preview URL
      const previewUrl = URL.createObjectURL(compressed);
      setPreview(previewUrl);

      // Convert to base64
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result.split(",")[1];
        const mimeType = compressed.type || "image/jpeg";
        onCapture({ base64, mimeType, previewUrl });
      };
      reader.readAsDataURL(compressed);
    } catch (error) {
      console.error("Image processing error:", error);
    } finally {
      setCompressing(false);
      // Reset input so same file can be re-selected
      e.target.value = "";
    }
  };

  const handleRetake = () => {
    setPreview(null);
    inputRef.current?.click();
  };

  return (
    <div className={styles.container} id="camera-capture">
      {/* Hidden file input — triggers native camera on mobile */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className={styles.hiddenInput}
        onChange={handleFileChange}
        id="camera-input"
      />

      {preview ? (
        <div className={styles.preview}>
          <img src={preview} alt="Food photo" className={styles.previewImage} />
          <div className={styles.previewOverlay}>
            <button
              className={`btn btn-secondary ${styles.retakeBtn}`}
              onClick={handleRetake}
              id="retake-photo-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 .49-3.51" />
              </svg>
              Retake
            </button>
          </div>
        </div>
      ) : (
        <button
          className={styles.captureButton}
          onClick={() => inputRef.current?.click()}
          disabled={compressing}
          id="open-camera-btn"
        >
          {compressing ? (
            <div className={styles.compressingState}>
              <div className="spinner" />
              <p>Processing…</p>
            </div>
          ) : (
            <div className={styles.captureContent}>
              <div className={styles.cameraIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <p className={styles.captureLabel}>Tap to scan your meal</p>
              <p className={styles.captureHint}>
                Point at your food and the AI will identify it
              </p>
            </div>
          )}
        </button>
      )}
    </div>
  );
}
