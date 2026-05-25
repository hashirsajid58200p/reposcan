"use client";

import { useEffect, useRef } from "react";

interface BackgroundCanvasProps {
  speedMultiplier?: number;
}

export default function BackgroundCanvas({ speedMultiplier = 1.0 }: BackgroundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef = useRef(speedMultiplier);

  // Keep the ref updated without re-triggering the canvas setup
  useEffect(() => {
    speedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let dots: Dot[] = [];
    const gridSize = 48;

    // Dot Class for managing individual particle state
    class Dot {
      x: number = 0;
      y: number = 0;
      dir: number = 0;
      speed: number = 0;
      canvasWidth: number;
      canvasHeight: number;

      constructor(width: number, height: number) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.reset(true);
      }

      reset(initial = false) {
        // Snap strictly to grid intersections
        this.x = Math.floor((Math.random() * this.canvasWidth) / gridSize) * gridSize;
        this.y = Math.floor((Math.random() * this.canvasHeight) / gridSize) * gridSize;

        // 0: up, 1: right, 2: down, 3: left
        this.dir = Math.floor(Math.random() * 4);
        
        // Speed: 40px to 80px per second -> 0.04 to 0.08 px per ms
        this.speed = (Math.random() * 40 + 40) / 1000;
      }

      update(dt: number) {
        const moveAmount = this.speed * dt * speedRef.current;

        const prevIntersectionX = Math.floor(this.x / gridSize) * gridSize;
        const prevIntersectionY = Math.floor(this.y / gridSize) * gridSize;

        if (this.dir === 0) this.y -= moveAmount;
        else if (this.dir === 1) this.x += moveAmount;
        else if (this.dir === 2) this.y += moveAmount;
        else if (this.dir === 3) this.x -= moveAmount;

        const nextIntersectionX = Math.floor(this.x / gridSize) * gridSize;
        const nextIntersectionY = Math.floor(this.y / gridSize) * gridSize;

        // Check for turns when crossing an intersection
        if ((this.dir === 1 || this.dir === 3) && prevIntersectionX !== nextIntersectionX) {
          this.snapAndTurn(nextIntersectionX, this.y);
        } else if ((this.dir === 0 || this.dir === 2) && prevIntersectionY !== nextIntersectionY) {
          this.snapAndTurn(this.x, nextIntersectionY);
        }

        // Seamless wrapping around edges
        if (this.x < 0) this.x = this.canvasWidth;
        if (this.x > this.canvasWidth) this.x = 0;
        if (this.y < 0) this.y = this.canvasHeight;
        if (this.y > this.canvasHeight) this.y = 0;
      }

      snapAndTurn(snapX: number, snapY: number) {
        // 15% chance to change axis
        if (Math.random() < 0.15) {
          this.x = snapX;
          this.y = snapY;
          // Switch between horizontal and vertical
          this.dir = (this.dir + (Math.random() > 0.5 ? 1 : 3)) % 4;
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = "rgba(255, 214, 0, 0.7)"; // #FFD600 accent
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const resizeCanvas = () => {
      // Handle high DPI displays for sharp rendering
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement?.getBoundingClientRect() || document.body.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // Reinitialize dots on resize to fill new area
      dots = Array.from({ length: 45 }, () => new Dot(rect.width, rect.height));
    };

    const drawGrid = (width: number, height: number) => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.11)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      
      for (let x = 0; x <= width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();
    };

    let lastTime = performance.now();
    const animate = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      // Extract raw width/height (unscaled) for drawing math
      const rect = canvas.getBoundingClientRect();

      ctx.clearRect(0, 0, rect.width, rect.height);
      drawGrid(rect.width, rect.height);

      dots.forEach((dot) => {
        dot.update(dt);
        dot.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    animationFrameId = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-bg-primary">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}