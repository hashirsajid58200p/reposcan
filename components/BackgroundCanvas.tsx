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
    let particles: Particle[] = [];
    const gridSize = 48;

    // Particle Class for managing Cyber Comet stream state
    class Particle {
      x: number = 0;
      y: number = 0;
      length: number = 0;
      speed: number = 0;
      axis: "x" | "y" = "x";
      direction: 1 | -1 = 1;
      canvasWidth: number;
      canvasHeight: number;

      constructor(width: number, height: number) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.reset(true);
      }

      reset(initial = false) {
        this.length = Math.random() * 40 + 25; // Tail length: 25px to 65px (shorter and sleeker)
        this.speed = (Math.random() * 150 + 100) / 1000; // Speed: 100px to 250px per second -> 0.1 to 0.25 px per ms
        this.axis = Math.random() > 0.5 ? "x" : "y";
        this.direction = Math.random() > 0.5 ? 1 : -1;

        // Collect occupied grid lines from active comets to enforce single-dot-per-line rule
        const occupiedY = new Set<number>();
        const occupiedX = new Set<number>();
        if (particles && particles.length > 0) {
          particles.forEach((p) => {
            if (p !== this) {
              if (p.axis === "x") occupiedY.add(p.y);
              else occupiedX.add(p.x);
            }
          });
        }

        if (this.axis === "x") {
          // Travel horizontally along a random Y grid line
          const numGridLinesY = Math.floor(this.canvasHeight / gridSize);
          let gridY = Math.floor(Math.random() * (numGridLinesY + 1));
          
          let attempts = 0;
          while (occupiedY.has(gridY * gridSize) && attempts < 50) {
            gridY = Math.floor(Math.random() * (numGridLinesY + 1));
            attempts++;
          }
          this.y = gridY * gridSize;

          if (this.direction === 1) {
            // Move left-to-right: spawn to the left of the screen
            this.x = initial ? Math.random() * this.canvasWidth : -this.length - 20;
          } else {
            // Move right-to-left: spawn to the right of the screen
            this.x = initial ? Math.random() * this.canvasWidth : this.canvasWidth + this.length + 20;
          }
        } else {
          // Travel vertically along a random X grid line
          const numGridLinesX = Math.floor(this.canvasWidth / gridSize);
          let gridX = Math.floor(Math.random() * (numGridLinesX + 1));
          
          let attempts = 0;
          while (occupiedX.has(gridX * gridSize) && attempts < 50) {
            gridX = Math.floor(Math.random() * (numGridLinesX + 1));
            attempts++;
          }
          this.x = gridX * gridSize;

          if (this.direction === 1) {
            // Move top-to-bottom: spawn above the screen
            this.y = initial ? Math.random() * this.canvasHeight : -this.length - 20;
          } else {
            // Move bottom-to-top: spawn below the screen
            this.y = initial ? Math.random() * this.canvasHeight : this.canvasHeight + this.length + 20;
          }
        }
      }

      update(dt: number) {
        const moveAmount = this.speed * dt * speedRef.current;

        if (this.axis === "x") {
          this.x += moveAmount * this.direction;

          // Check if particle is completely off-screen (including its tail)
          if (this.direction === 1 && this.x > this.canvasWidth + this.length + 50) {
            this.reset(false);
          } else if (this.direction === -1 && this.x < -this.length - 50) {
            this.reset(false);
          }
        } else {
          this.y += moveAmount * this.direction;

          // Check if particle is completely off-screen (including its tail)
          if (this.direction === 1 && this.y > this.canvasHeight + this.length + 50) {
            this.reset(false);
          } else if (this.direction === -1 && this.y < -this.length - 50) {
            this.reset(false);
          }
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        // 1. Draw a localized highlighted laser path (like a car headlight) along the grid track
        const lightSpan = 100; // illuminates 100px ahead and 100px behind the dot
        ctx.beginPath();
        let pathGrad: CanvasGradient;

        if (this.axis === "x") {
          pathGrad = ctx.createLinearGradient(
            this.x - lightSpan,
            this.y,
            this.x + lightSpan,
            this.y
          );
        } else {
          pathGrad = ctx.createLinearGradient(
            this.x,
            this.y - lightSpan,
            this.x,
            this.y + lightSpan
          );
        }

        pathGrad.addColorStop(0, "rgba(255, 214, 0, 0)");
        pathGrad.addColorStop(0.5, "rgba(255, 214, 0, 0.16)"); // Peak glow right around the head
        pathGrad.addColorStop(1, "rgba(255, 214, 0, 0)");

        ctx.strokeStyle = pathGrad;
        ctx.lineWidth = 0.75;

        if (this.axis === "x") {
          ctx.moveTo(this.x - lightSpan, this.y);
          ctx.lineTo(this.x + lightSpan, this.y);
        } else {
          ctx.moveTo(this.x, this.y - lightSpan);
          ctx.lineTo(this.x, this.y + lightSpan);
        }
        ctx.stroke();

        // 2. Draw the glowing Cyber Comet (Head Dot AND its Tail together!)
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = "#FFD600";

        // Draw tapered cometary tail in segmented increments to adjust thickness dynamically
        const numSegments = 12;
        const startWidth = 5.0; // Matches dot diameter (radius 2.5 * 2)
        const endWidth = 0.2;

        for (let i = 0; i < numSegments; i++) {
          const tStart = i / numSegments;
          const tEnd = (i + 1) / numSegments;

          let sx = this.x;
          let sy = this.y;
          let ex = this.x;
          let ey = this.y;

          const distStart = tStart * this.length;
          const distEnd = tEnd * this.length;

          if (this.axis === "x") {
            sx = this.x - distStart * this.direction;
            ex = this.x - distEnd * this.direction;
          } else {
            sy = this.y - distStart * this.direction;
            ey = this.y - distEnd * this.direction;
          }

          // Gradually decrease width and opacity
          const segmentWidth = startWidth - tStart * (startWidth - endWidth);
          const opacity = 1.0 - tStart;

          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 214, 0, ${opacity})`;
          ctx.lineWidth = segmentWidth;
          ctx.lineCap = "round";
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
        }

        // Draw the circular head dot (keeps leading edge perfectly rounded)
        ctx.fillStyle = "#FFD600";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement?.getBoundingClientRect() || document.body.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      // 12 active concurrent data stream particles is perfectly clean, elegant, and minimal
      particles = Array.from({ length: 12 }, () => new Particle(rect.width, rect.height));
    };

    const drawGrid = (width: number, height: number) => {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.10)";
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

      const rect = canvas.getBoundingClientRect();

      ctx.clearRect(0, 0, rect.width, rect.height);
      drawGrid(rect.width, rect.height);

      particles.forEach((particle) => {
        particle.update(dt);
        particle.draw(ctx);
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