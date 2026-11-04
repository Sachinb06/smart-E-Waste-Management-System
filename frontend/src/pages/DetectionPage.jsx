import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  Video, 
  VideoOff, 
  RefreshCw, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldAlert, 
  SwitchCamera,
  Info,
  Layers,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { api } from '../services/api';
import BoundingBoxOverlay from '../components/BoundingBoxOverlay';
import HazardWarningBadge from '../components/HazardWarningBadge';

const EWASTE_CATEGORIES = [
  "Mobile Phones & Gadgets",
  "Computers & Accessories",
  "Batteries",
  "Cables & Chargers",
  "TVs & Monitors",
  "Other Electronic Waste",
  "Unknown / Not E-Waste"
];

export default function DetectionPage({ setActivePage, setPendingRequestPrefill }) {
  // Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' or 'environment'
  const [cameraError, setCameraError] = useState(null);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });

  // Capture / Image state
  const [capturedImage, setCapturedImage] = useState(null); // Data URL
  const [capturedBlob, setCapturedBlob] = useState(null);

  // AI Inference state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Manual category override state
  const [selectedCategoryOverride, setSelectedCategoryOverride] = useState('');

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Enumerate available camera devices
  const updateDeviceList = useCallback(async () => {
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      }
    } catch (e) {
      console.warn("Could not enumerate camera devices:", e);
    }
  }, [selectedDeviceId]);

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setVideoDimensions({ width: 0, height: 0 });
  }, []);

  // Start Camera with flexible constraints & automatic fallback
  const startCamera = async (deviceId = selectedDeviceId, mode = facingMode) => {
    stopCamera();
    setCameraError(null);
    setErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera access is not supported by your browser or connection. Please upload an image file instead.");
      return;
    }

    try {
      // Primary constraint: specify deviceId if selected, or facingMode
      const constraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } }
          : {
              facingMode: mode ? { ideal: mode } : undefined,
              width: { ideal: 1280 },
              height: { ideal: 720 }
            },
        audio: false
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (primaryErr) {
        console.warn("Primary camera constraint failed, falling back to simple video: true", primaryErr);
        // Fallback constraint
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      mediaStreamRef.current = stream;

      // Attach stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setVideoDimensions({
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
          });
          videoRef.current.play().catch(err => {
            console.warn("video.play() autoplay restriction:", err);
          });
        };
        // Explicitly trigger play
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Autoplay error, waiting for onloadedmetadata:", playErr);
        }
      }

      setIsCameraActive(true);
      setCapturedImage(null);
      setCapturedBlob(null);
      setDetectionResult(null);

      // Refresh device list now that permission was granted
      await updateDeviceList();
    } catch (err) {
      console.error("Camera access error:", err);
      let msg = err.message;
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = "Camera permission was denied. Please click the lock / camera icon in your browser's address bar to grant permission.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = "No webcam device was found on your computer. Please connect a webcam or upload a photo instead.";
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = "Camera is currently in use by another application (e.g. Zoom, Teams, or another tab). Please close other apps and try again.";
      }
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  // Toggle Front / Rear Camera
  const switchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    setSelectedDeviceId(''); // clear exact device id to allow facing mode switch
    startCamera('', nextMode);
  };

  // Handle manual device selection
  const handleDeviceChange = (e) => {
    const deviceId = e.target.value;
    setSelectedDeviceId(deviceId);
    if (isCameraActive) {
      startCamera(deviceId);
    }
  };

  // Capture frame from active video feed
  const captureImageFromVideo = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    if (width === 0 || height === 0) {
      setErrorMessage("Camera feed is still initializing. Please wait a second and click Capture again.");
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Draw the active video frame
    ctx.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);

    canvas.toBlob((blob) => {
      setCapturedBlob(blob);
    }, 'image/jpeg', 0.95);

    // Stop camera stream after snapshot
    stopCamera();
    setDetectionResult(null);
    setErrorMessage(null);
  };

  // File Upload fallback
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage("Please select a valid image file (JPG, PNG, or WEBP).");
      return;
    }

    setCapturedBlob(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result);
      setDetectionResult(null);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
    stopCamera();
  };

  // Sample Images for testing detection without camera
  const loadSampleImage = async (type) => {
    stopCamera();
    setIsAnalyzing(true);
    setErrorMessage(null);

    // Create a mock canvas image representing the object
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 640, 480);

    if (type === 'phone') {
      // Draw phone
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(220, 80, 200, 320, 24);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(235, 110, 170, 250);
    } else if (type === 'laptop') {
      // Draw laptop
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(140, 100, 360, 220, 16);
      ctx.fill();
      ctx.fillStyle = '#64748b';
      ctx.fillRect(160, 120, 320, 180);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(110, 320, 420, 25, 8);
      ctx.fill();
    } else {
      // Draw battery
      ctx.fillStyle = '#15803d';
      ctx.fillRect(240, 140, 160, 240);
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(290, 110, 60, 30);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedImage(dataUrl);

    canvas.toBlob(async (blob) => {
      setCapturedBlob(blob);
      try {
        const file = new File([blob], `${type}_sample.jpg`, { type: 'image/jpeg' });
        const result = await api.detectEwaste(file);
        setDetectionResult(result);
        setSelectedCategoryOverride(result.category);
      } catch (err) {
        setErrorMessage(err.message || "Failed to process sample image.");
      } finally {
        setIsAnalyzing(false);
      }
    }, 'image/jpeg', 0.95);
  };

  // Retake / Reset
  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
    setDetectionResult(null);
    setErrorMessage(null);
    setSelectedCategoryOverride('');
    startCamera();
  };

  // Send image to backend FastAPI detection model
  const runAIDetection = async () => {
    if (!capturedBlob) {
      setErrorMessage("No image available. Please start camera, upload a photo, or choose a sample item.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const fileToUpload = capturedBlob instanceof File 
        ? capturedBlob 
        : new File([capturedBlob], "webcam_capture.jpg", { type: "image/jpeg" });

      const result = await api.detectEwaste(fileToUpload);
      setDetectionResult(result);
      setSelectedCategoryOverride(result.category);
    } catch (err) {
      setErrorMessage(err.message || "Failed to communicate with AI Detection server.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Continue to Collection Request with prefilled data
  const handleContinueToRequest = () => {
    const finalCategory = selectedCategoryOverride || detectionResult?.category || "Other Electronic Waste";
    const prefillData = {
      itemName: detectionResult?.detected_object 
        ? `${detectionResult.detected_object.charAt(0).toUpperCase() + detectionResult.detected_object.slice(1)}` 
        : "Electronic Device",
      category: finalCategory,
      detectionId: detectionResult?.history_id || null,
      imageUrl: detectionResult?.image_url || capturedImage,
      isHazard: detectionResult?.is_hazard || false,
      condition: detectionResult?.is_hazard ? "Swollen / Hazardous Battery" : "Used / Non-functional"
    };

    setPendingRequestPrefill(prefillData);
    setActivePage('request');
  };

  // Cleanup on unmount
  useEffect(() => {
    updateDeviceList();
    return () => {
      stopCamera();
    };
  }, [stopCamera, updateDeviceList]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <Camera className="w-3.5 h-3.5 text-emerald-600" />
          <span>Computer Vision Detection Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          AI Camera E-Waste Detection
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Point your device camera at an electronic item or upload an image. The AI model detects bounding boxes, calculates confidence, and assigns the correct collection bin.
        </p>
      </div>

      {/* Main Detection Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Camera / Image Viewport */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isCameraActive ? 'bg-emerald-500 animate-ping' : capturedImage ? 'bg-blue-500' : 'bg-slate-300'}`} />
              <span className="text-xs font-bold text-slate-800">
                {isCameraActive 
                  ? `Live Camera Stream ${videoDimensions.width ? `(${videoDimensions.width}x${videoDimensions.height})` : ''}` 
                  : capturedImage ? 'Captured Snapshot' : 'Camera Ready'}
              </span>
            </div>

            {/* Camera Controls & Device Picker */}
            <div className="flex items-center gap-2 flex-wrap">
              {videoDevices.length > 1 && (
                <select
                  value={selectedDeviceId}
                  onChange={handleDeviceChange}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 rounded-lg border border-slate-200 focus:outline-none"
                >
                  {videoDevices.map((d, i) => (
                    <option key={d.deviceId || i} value={d.deviceId}>
                      {d.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              )}

              {isCameraActive && (
                <button
                  onClick={switchCamera}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  <SwitchCamera className="w-3.5 h-3.5" />
                  <span>Flip ({facingMode === 'environment' ? 'Rear' : 'Front'})</span>
                </button>
              )}
            </div>
          </div>

          {/* Viewport Frame */}
          <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden flex items-center justify-center border border-slate-800 shadow-inner">
            
            {/* 1. Live Video Element (ALWAYS mounted in DOM to guarantee ref.current and srcObject connection) */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isCameraActive && !capturedImage ? 'block opacity-100' : 'hidden opacity-0'
              }`}
            />

            {/* 2. Captured Image with Bounding Box Overlay */}
            {capturedImage && (
              <div className="w-full h-full relative">
                {detectionResult?.bounding_box ? (
                  <BoundingBoxOverlay
                    imageSrc={capturedImage}
                    boundingBox={detectionResult.bounding_box}
                    detectedObject={detectionResult.detected_object}
                    category={detectionResult.category}
                    confidence={detectionResult.confidence}
                    isHazard={detectionResult.is_hazard}
                  />
                ) : (
                  <img
                    src={capturedImage}
                    alt="Captured Item"
                    className="w-full h-full object-contain mx-auto"
                  />
                )}

                {/* Radar Scan Animation during Inference */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-xs flex flex-col items-center justify-center">
                    <div className="w-full h-1.5 bg-emerald-400 shadow-[0_0_20px_#34d399] animate-scan absolute left-0" />
                    <div className="bg-slate-900/90 text-white px-5 py-3 rounded-2xl border border-emerald-500/50 flex items-center gap-3 shadow-xl">
                      <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                      <div className="text-left">
                        <p className="text-xs font-bold">Running YOLO Neural Network...</p>
                        <p className="text-[10px] text-slate-400">Classifying electronic waste features</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. Empty State (Camera Stopped & No Image) */}
            {!isCameraActive && !capturedImage && (
              <div className="text-center p-8 space-y-4 max-w-sm">
                <div className="w-16 h-16 rounded-3xl bg-slate-900 text-slate-400 border border-slate-800 flex items-center justify-center mx-auto shadow-sm">
                  <Camera className="w-8 h-8 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Camera is currently inactive</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Click "Start Camera" to turn on your webcam, upload an existing image, or pick a sample electronic item below.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Camera Error Alert */}
          {cameraError && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Camera Access Notice</p>
                <p>{cameraError}</p>
                <p className="text-[11px] text-amber-800">
                  Tip: If your browser displays a permission prompt, click "Allow". You can also test with an image file or test samples below.
                </p>
              </div>
            </div>
          )}

          {/* Action Controls */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            
            {!isCameraActive && !capturedImage && (
              <>
                <button
                  onClick={() => startCamera()}
                  className="flex-1 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" />
                  Start Camera
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  Upload Image
                </button>
              </>
            )}

            {isCameraActive && (
              <>
                <button
                  onClick={captureImageFromVideo}
                  className="flex-1 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 animate-pulse"
                >
                  <Camera className="w-4 h-4" />
                  Capture Snapshot
                </button>

                <button
                  onClick={stopCamera}
                  className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors flex items-center gap-1.5"
                >
                  <VideoOff className="w-4 h-4 text-slate-500" />
                  Stop Camera
                </button>
              </>
            )}

            {capturedImage && (
              <>
                <button
                  onClick={runAIDetection}
                  disabled={isAnalyzing}
                  className="flex-1 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing Image...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Detect Object
                    </>
                  )}
                </button>

                <button
                  onClick={handleRetake}
                  disabled={isAnalyzing}
                  className="py-3.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retake / Reset
                </button>
              </>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />

          </div>

          {/* Quick Test Demo Samples Bar */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Or test with sample item:
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadSampleImage('phone')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
              >
                Smartphone
              </button>
              <button
                onClick={() => loadSampleImage('laptop')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
              >
                Laptop
              </button>
              <button
                onClick={() => loadSampleImage('battery')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition-colors"
              >
                Battery
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: AI Results & Recommended Collection Bin */}
        <div className="lg:col-span-5 space-y-6">

          {/* Detection Results Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Detection Results
              </h3>
              {detectionResult && (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  detectionResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {detectionResult.success ? 'Prediction Verified' : 'Review Required'}
                </span>
              )}
            </div>

            {/* Initial Empty Guide */}
            {!detectionResult && !isAnalyzing && (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">Awaiting Image Capture</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Start the camera and click "Capture Snapshot", or select an image file to trigger YOLO computer vision inference.
                </p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-600" /> Notice
                </p>
                <p>{errorMessage}</p>
              </div>
            )}

            {/* Actual Result Details */}
            {detectionResult && (
              <div className="space-y-6">

                {/* Primary Object & Confidence */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Detected Object
                      </span>
                      <span className="text-lg font-extrabold text-slate-900 capitalize">
                        {detectionResult.detected_object}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Model Confidence
                      </span>
                      <span className="text-base font-extrabold text-emerald-600">
                        {(detectionResult.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Confidence Progress Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        detectionResult.confidence > 0.6 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.max(5, detectionResult.confidence * 100)}%` }}
                    />
                  </div>
                </div>

                {/* E-Waste Category Selection / Override */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>E-Waste Category:</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Correct category if needed)</span>
                  </label>
                  <select
                    value={selectedCategoryOverride}
                    onChange={(e) => setSelectedCategoryOverride(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {EWASTE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* RECOMMENDED COLLECTION BIN */}
                <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                      Recommended Collection Bin
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  </div>
                  <h4 className="text-lg font-black tracking-tight">
                    {detectionResult.recommended_bin}
                  </h4>
                  <p className="text-[11px] text-emerald-100 leading-snug">
                    Deposit in designated smart bay at any certified Smart E-Waste Hub.
                  </p>
                </div>

                {/* Hazard Warning Badge */}
                <HazardWarningBadge
                  isHazard={detectionResult.is_hazard}
                  warningText={detectionResult.hazard_warning}
                  category={detectionResult.category}
                />

                {/* Safe Handling Instructions */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1.5">
                  <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-emerald-600" /> Safe Handling & Disposal Guidance
                  </h5>
                  <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">
                    {detectionResult.disposal_guidance}
                  </p>
                </div>

                {/* Next Action: Continue to Request or Retry */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleContinueToRequest}
                    className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span>Continue to Collection Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleRetake}
                    className="w-full py-2.5 text-center text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Retake / Try Another Item
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* Quick Category Reference */}
          <div className="bg-emerald-50/70 rounded-3xl border border-emerald-100 p-5 space-y-2 text-xs text-slate-700">
            <h5 className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" /> Did the model recognize your device?
            </h5>
            <p className="leading-relaxed">
              If the device is fragmented, custom, or occluded, you can adjust the category dropdown above before proceeding to the collection request form.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
