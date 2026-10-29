import React, { useEffect, useRef } from 'react';

interface MatrixRainProps {
  opacity?: number;
  speed?: number;
  enabled?: boolean;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({
  opacity = 0.22,
  speed = 1,
  enabled = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Caracteres Matrix + Símbolos Aritméticos e Números de Calculadora
    const chars = '0123456789+-*/=0123456789+-*/=アイウエオカキケコサシスセソタチツテトナニヌネハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = new Array(columns).fill(1).map(() => Math.floor(Math.random() * -50));

    let lastDraw = 0;
    const interval = 45 / speed;

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (currentTime - lastDraw < interval) return;
      lastDraw = currentTime;

      // Desvanecer o frame anterior para criar rastro
      ctx.fillStyle = 'rgba(0, 5, 2, 0.12)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "Share Tech Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Cabeça brilhante do rastro (verde claro / branco)
        if (Math.random() > 0.9) {
          ctx.fillStyle = '#b6ffc0';
          ctx.shadowColor = '#00ff41';
          ctx.shadowBlur = 6;
        } else {
          ctx.fillStyle = '#00ff41';
          ctx.shadowBlur = 0;
        }

        ctx.fillText(text, x, y);

        // Reiniciar gota quando atingir o final da tela
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [enabled, speed]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity }}
      aria-hidden="true"
    />
  );
};
