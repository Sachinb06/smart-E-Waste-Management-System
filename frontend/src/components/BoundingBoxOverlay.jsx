import React, { useEffect, useRef } from 'react';

export default function BoundingBoxOverlay({ 
  imageSrc, 
  boundingBox, 
  detectedObject, 
  category, 
  confidence, 
  isHazard 
}) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    const renderBox = () => {
      const ctx = canvas.getContext('2d');
      const naturalWidth = img.naturalWidth || 640;
      const naturalHeight = img.naturalHeight || 480;
      const displayWidth = img.clientWidth;
      const displayHeight = img.clientHeight;

      canvas.width = displayWidth;
      canvas.height = displayHeight;
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      if (!boundingBox) return;

      const scaleX = displayWidth / naturalWidth;
      const scaleY = displayHeight / naturalHeight;

      const x = boundingBox.x1 * scaleX;
      const y = boundingBox.y1 * scaleY;
      const width = (boundingBox.x2 - boundingBox.x1) * scaleX;
      const height = (boundingBox.y2 - boundingBox.y1) * scaleY;

      // Color scheme based on hazard
      const primaryColor = isHazard ? '#ef4444' : '#10b981';
      const bgColor = isHazard ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';

      // 1. Draw soft filled area
      ctx.fillStyle = bgColor;
      ctx.fillRect(x, y, width, height);

      // 2. Draw border
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.strokeRect(x, y, width, height);

      // 3. Draw high-tech corner brackets
      const cornerLength = Math.min(20, width / 4, height / 4);
      ctx.lineWidth = 5;
      ctx.strokeStyle = primaryColor;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(x, y + cornerLength);
      ctx.lineTo(x, y);
      ctx.lineTo(x + cornerLength, y);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(x + width - cornerLength, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width, y + cornerLength);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(x, y + height - cornerLength);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x + cornerLength, y + height);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(x + width - cornerLength, y + height);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x + width, y + height - cornerLength);
      ctx.stroke();

      // 4. Draw label banner
      const labelText = `${detectedObject.toUpperCase()} (${(confidence * 100).toFixed(1)}%)`;
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      const textWidth = ctx.measureText(labelText).width;
      const bannerHeight = 24;
      const bannerWidth = textWidth + 16;

      const bannerY = y > bannerHeight + 6 ? y - bannerHeight : y + 4;

      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.roundRect(x, bannerY, bannerWidth, bannerHeight, [4, 4, 4, 4]);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(labelText, x + 8, bannerY + 16);
    };

    if (img.complete) {
      renderBox();
    } else {
      img.onload = renderBox;
    }

    window.addEventListener('resize', renderBox);
    return () => window.removeEventListener('resize', renderBox);
  }, [imageSrc, boundingBox, detectedObject, confidence, isHazard]);

  return (
    <div ref={containerRef} className="relative inline-block w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
      <img
        ref={imageRef}
        src={imageSrc}
        alt="Captured E-Waste"
        className="w-full h-auto max-h-[500px] object-contain mx-auto block"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full"
      />
    </div>
  );
}
