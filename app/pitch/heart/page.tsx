"use client";

import { useState, useEffect } from "react";
import { Heatmap } from "@paper-design/shaders-react";

const HEAT_COLORS = ["#120500","#2a0d00","#5a2205","#a84a10","#d96b1c","#f5893a","#ffd090"];

function useLoadedImage(src: string) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => setImg(image);
    image.src = src;
  }, [src]);
  return img;
}

export default function HeartPage() {
  const logoImage = useLoadedImage("/selantar-logo.png");

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      <div style={{
        width: 800, height: 800,
        maskImage: "radial-gradient(circle at 50% 50%, black 35%, transparent 72%)",
        WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 35%, transparent 72%)",
      }}>
        {logoImage && (
          <Heatmap
            width={800}
            height={800}
            image={logoImage}
            colors={HEAT_COLORS}
            colorBack="#070300"
            contour={0.42}
            angle={0}
            noise={0.015}
            innerGlow={0.8}
            outerGlow={0.9}
            speed={1.2}
            scale={0.78}
          />
        )}
      </div>
    </div>
  );
}
