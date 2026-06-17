"use client";

import { useRef, useState, useEffect } from "react";
import styles from "./RealtimeCamera.module.css";

export default function RealtimeCamera({ onDetectFoods, scanning }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);

  // Initialize camera
  useEffect(() => {
    let stream = null;
    
    async function setupCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasPermission(true);
      } catch (err) {
        console.error("Camera permission error:", err);
        setError("Camera permission denied or camera not found. Please enable it in browser settings.");
      }
    }

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Frame capture loop
  useEffect(() => {
    if (!scanning || !hasPermission) return;

    const captureFrame = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ensure video is ready
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      // Scale down image to save bandwidth (max 1024 width/height)
      const scale = Math.min(1, 1024 / Math.max(video.videoWidth, video.videoHeight));
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Compress jpeg
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      
      try {
        const base64 = dataUrl.split(",")[1];
        
        const res = await fetch("/api/scan-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64, mimeType: "image/jpeg" }),
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.foods && data.foods.length > 0) {
            // Pass foods and the frame used to detect them
            onDetectFoods(data.foods, { base64, mimeType: "image/jpeg", previewUrl: dataUrl });
          }
        }
      } catch (err) {
        console.error("Frame analysis failed:", err);
      }
    };

    const intervalId = setInterval(captureFrame, 3000);
    const timeoutId = setTimeout(captureFrame, 1000); // Initial capture

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [scanning, hasPermission, onDetectFoods]);

  return (
    <div className={styles.container}>
      {error ? (
        <div className={styles.errorBanner}>{error}</div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={styles.videoStream}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          
          {scanning && (
            <div className={styles.scannerOverlay}>
               <div className={styles.scannerLine}></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
