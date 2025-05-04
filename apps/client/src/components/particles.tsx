import { RefObject, useEffect, useRef } from 'react';

interface Vector2 {
  x: number;
  y: number;
}

const Particles = () => {
  const canvasRef: RefObject<HTMLCanvasElement | null> =
    useRef<HTMLCanvasElement>(null);
  const mouse: RefObject<Vector2> = useRef({ x: -1000, y: -1000 });
  const particles: RefObject<any[]> = useRef<any[]>([]);

  const particlesAmount = 80;
  const maxDistance = 120;

  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    let width: number = (canvas.width = window.innerWidth);
    let height: number = (canvas.height = window.innerHeight);

    const generateParticles = (): void => {
      particles.current = Array.from({ length: particlesAmount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
      }));
    };

    generateParticles();

    const handleMouseMove = (e: MouseEvent): void => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleResize = (): void => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      generateParticles();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    const draw = (): void => {
      ctx.clearRect(0, 0, width, height);
      const isDark: boolean =
        document.documentElement.classList.contains('dark');
      const dotColor: string = isDark
        ? 'rgba(255,255,255,0.3)'
        : 'rgba(0,0,0,0.6)';
      const lineColor: string = isDark
        ? 'rgba(255,255,255,0.2)'
        : 'rgba(0,0,0,0.2)';

      for (const particle of particles.current) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x <= 0 || particle.x >= width) {
          particle.vx *= -1;
        }

        if (particle.y <= 0 || particle.y >= height) {
          particle.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
      }

      for (let i = 0; i < particles.current.length; i++) {
        for (let j = i + 1; j < particles.current.length; j++) {
          const p1: Vector2 = particles.current[i];
          const p2: Vector2 = particles.current[j];
          const dx: number = p1.x - p2.x;
          const dy: number = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha: number = 1 - dist / maxDistance;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/g, `${alpha})`);
            ctx.stroke();
          }
        }

        const p: Vector2 = particles.current[i];
        const dx: number = p.x - mouse.current.x;
        const dy: number = p.y - mouse.current.y;
        const distToMouse: number = Math.sqrt(dx * dx + dy * dy);

        if (distToMouse < maxDistance) {
          const alpha: number = 1 - distToMouse / maxDistance;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.current.x, mouse.current.y);
          ctx.strokeStyle = lineColor.replace(/[\d.]+\)$/g, `${alpha})`);
          ctx.stroke();
        }
      }

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
    />
  );
};

export default Particles;
