import React, { useEffect, useRef } from 'react';

/**
 * Visualizer canvas tạo hiệu ứng sóng âm thanh neon (Cyan & Violet)
 * uốn lượn mượt mà chuẩn phong cách âm nhạc hiện đại như bản design.
 */
export default function AudioWaveVisualizer() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement.offsetWidth);
    let height = (canvas.height = canvas.parentElement.offsetHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    let step = 0;

    const lines = [
      {
        colorStart: 'rgba(168, 85, 247, 0.85)', // Purple/Violet
        colorEnd: 'rgba(6, 182, 212, 0.85)',    // Cyan
        frequency: 0.008,
        amplitude: 55,
        speed: 0.02,
        offset: 0,
        lineWidth: 3,
        blur: 16,
      },
      {
        colorStart: 'rgba(139, 92, 246, 0.6)',
        colorEnd: 'rgba(56, 189, 248, 0.6)',
        frequency: 0.012,
        amplitude: 45,
        speed: 0.025,
        offset: 1.5,
        lineWidth: 2,
        blur: 12,
      },
      {
        colorStart: 'rgba(192, 132, 252, 0.45)',
        colorEnd: 'rgba(34, 211, 238, 0.45)',
        frequency: 0.015,
        amplitude: 35,
        speed: 0.018,
        offset: 3.2,
        lineWidth: 1.5,
        blur: 8,
      },
      {
        colorStart: 'rgba(99, 102, 241, 0.4)',
        colorEnd: 'rgba(20, 184, 166, 0.4)',
        frequency: 0.007,
        amplitude: 65,
        speed: 0.014,
        offset: 4.8,
        lineWidth: 2,
        blur: 20,
      },
    ];

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Multiple dense wireframe ribbon lines to match the exact look
      const ribbonCount = 28;
      const centerY = height * 0.52;

      for (let r = 0; r < ribbonCount; r++) {
        const progress = r / ribbonCount;
        ctx.beginPath();
        
        // Dynamic gradient for each ribbon
        const gradient = ctx.createLinearGradient(0, 0, width, 0);
        gradient.addColorStop(0, `rgba(168, 85, 247, ${0.15 + (1 - Math.abs(progress - 0.5) * 2) * 0.45})`);
        gradient.addColorStop(0.45, `rgba(192, 132, 252, ${0.3 + (1 - Math.abs(progress - 0.5) * 2) * 0.6})`);
        gradient.addColorStop(0.7, `rgba(6, 182, 212, ${0.35 + (1 - Math.abs(progress - 0.5) * 2) * 0.6})`);
        gradient.addColorStop(1, `rgba(34, 211, 238, ${0.15 + (1 - Math.abs(progress - 0.5) * 2) * 0.45})`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.2;

        for (let x = 0; x <= width; x += 4) {
          // Bell curve to keep waves prominent in the center & graceful at ends
          const envelope = Math.sin((x / width) * Math.PI);
          const yOffset = (progress - 0.5) * 70;
          
          const y =
            centerY +
            yOffset +
            Math.sin(x * 0.007 + step * 0.8 + progress * 2.2) * 45 * envelope +
            Math.cos(x * 0.014 - step * 0.5 + progress * 1.5) * 25 * envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      step += 0.018;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="audio-wave-canvas"
      aria-hidden="true"
    />
  );
}
