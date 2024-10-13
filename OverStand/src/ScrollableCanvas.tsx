import React, { useState, useRef, useEffect } from 'react';

interface ScrollableCanvasProps {
  images: string[]; // Array of image URLs
  width: number;
  height: number;
}

const ScrollableCanvas: React.FC<ScrollableCanvasProps> = ({ images, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [loadedImages, setLoadedImages] = useState<HTMLImageElement[]>([]);
  const [dragging, setDragging] = useState(false);
  const [selection, setSelection] = useState<{
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = images.map(src => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      });

      const loadedImgs = await Promise.all(imagePromises);
      setLoadedImages(loadedImgs);
    };

    loadImages();
  }, [images]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    loadedImages.forEach((img, index) => {
      const y = index * height - scrollPosition;
      ctx.drawImage(img, 0, y, width, height);
    });
  }, [loadedImages, scrollPosition, width, height]);

  const handleScroll = (e: React.WheelEvent<HTMLCanvasElement>) => {
    const newScrollPosition = scrollPosition + e.deltaY;
    setScrollPosition(Math.max(0, Math.min(newScrollPosition, (loadedImages.length - 1) * height)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragging(true);
      setSelection({
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && selection && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      setSelection({
        ...selection,
        endX: e.clientX - rect.left,
        endY: e.clientY - rect.top,
      });
    }
  };

  const handleMouseUp = () => {
    if (dragging) {
      setDragging(false);
      captureSelection();
    }
  };

  const captureSelection = () => {
    if (selection && canvasRef.current) {
      const { startX, startY, endX, endY } = selection;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const width = endX - startX;
      const height = endY - startY;
      if (context && width > 0 && height > 0) {
        const imageData = context.getImageData(startX, startY, width, height);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempContext = tempCanvas.getContext('2d');
        if (tempContext) {
          tempContext.putImageData(imageData, 0, 0);
          tempCanvas.toBlob((blob) => {
            if (blob) {
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = 'screenshot.png';
              link.click();
            }
          });
        }
      }
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onWheel={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          width: "500px",
          height: "500px",
          border: '1px solid black',
          cursor: dragging ? 'crosshair' : 'default'
        }}
      />
      {dragging && selection && (
        <div
          style={{
            position: 'absolute',
            border: '2px dashed red',
            left: selection.startX,
            top: selection.startY,
            width: selection.endX - selection.startX,
            height: selection.endY - selection.startY,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

export default ScrollableCanvas;
