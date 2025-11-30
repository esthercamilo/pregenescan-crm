import { useEffect, useRef, useState } from "react";

export default function CorpoInterativo({ onRegionClick }) {
  const containerRef = useRef(null);

  // 👉 região inicial já selecionada
  const [activeRegion, setActiveRegion] = useState("brain");

  useEffect(() => {
    fetch("/body.svg")
      .then((r) => r.text())
      .then((svgText) => {
        containerRef.current.innerHTML = svgText;

        const svg = containerRef.current.querySelector("svg");

        // 👉 aplica highlight inicial
        if (activeRegion) {
          const initial = svg.querySelector(`#${activeRegion}`);
          if (initial) initial.style.fill = "#fe615a";
        }

        svg.addEventListener("click", (e) => {
          const regionId = e.target.getAttribute("id");
          if (!regionId) return;

          // remove highlight anterior
          if (activeRegion) {
            const prev = svg.querySelector(`#${activeRegion}`);
            if (prev) prev.style.fill = "";
          }

          // adiciona novo highlight
          const element = svg.querySelector(`#${regionId}`);
          if (element) element.style.fill = "#fe615a";

          setActiveRegion(regionId);
          onRegionClick(regionId);
        });
      });
  }, [onRegionClick]);

  return (
    <div className="w-full h-full flex justify-center">
      <div ref={containerRef} className="w-full max-w-[400px] cursor-pointer" />
    </div>
  );
}
