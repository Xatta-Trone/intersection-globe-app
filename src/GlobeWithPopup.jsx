/** @format */

import React, { useRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";

const GlobeWithMarkers = () => {
  const globeRef = useRef();
  const [selectedMarker, setSelectedMarker] = useState(null);

  const markerSvg = `<svg viewBox="-4 0 36 36">
    <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
    <circle fill="black" cx="14" cy="14" r="7"></circle>
  </svg>`;

  const markerData = Array.from({ length: 30 }, (_, i) => ({
    id: i + 1,
    lat: (Math.random() - 0.5) * 180,
    lng: (Math.random() - 0.5) * 360,
    size: 15 + Math.random() * 20,
    color: ["red", "blue", "green", "orange"][Math.floor(Math.random() * 4)],
    image: `https://picsum.photos/400/200?random=${i + 1}`,
    title: `Marker #${i + 1}`,
    description: `This is a random location point (#${i + 1}) on the globe.`,
  }));

  useEffect(() => {
    globeRef.current.controls().autoRotate = true;
    globeRef.current.controls().autoRotateSpeed = 0.4;
  }, []);

  const handleMarkerClick = (d) => {
    const controls = globeRef.current.controls();
    if (controls.autoRotate) {
      controls.autoRotate = false;
      controls.update(); // Apply immediately
    }

    globeRef.current.pointOfView(
      { lat: d.lat, lng: d.lng, altitude: 1.5 },
      1500
    );
    setTimeout(() => setSelectedMarker(d), 1600);
  };

  const handleOverlayClick = (e) => {
    if (e.target.id === "modal-overlay") {
      setSelectedMarker(null);
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        position: "relative",
        background: "#000",
      }}
    >
      <Globe
        ref={globeRef}
        globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
        htmlElementsData={markerData}
        htmlElement={(d) => {
          const el = document.createElement("div");
          el.innerHTML = markerSvg;
          el.style.color = d.color;
          el.style.width = `${d.size}px`;
          el.style.transition = "opacity 250ms";
          el.style.pointerEvents = "auto";
          el.style.cursor = "pointer";

          el.onclick = () => handleMarkerClick(d);
          return el;
        }}
        htmlElementVisibilityModifier={(el, isVisible) => {
          el.style.opacity = isVisible ? 1 : 0;
        }}
      />

      {selectedMarker && (
        <div
          id="modal-overlay"
          style={modalOverlayStyle}
          onClick={handleOverlayClick}
        >
          <div style={modalStyle}>
            <button
              style={closeButtonStyle}
              onClick={() => setSelectedMarker(null)}
            >
              &times;
            </button>
            <img
              src={selectedMarker.image}
              alt={selectedMarker.title}
              style={{
                width: "100%",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            />
            <h2 style={{ marginBottom: "10px" }}>{selectedMarker.title}</h2>
            <p style={{ fontSize: "14px", color: "#555" }}>
              {selectedMarker.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// 🌟 Modal Styles
const modalOverlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "10px",
  width: "90%",
  maxWidth: "400px",
  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.3)",
  position: "relative",
  animation: "fadeIn 0.3s ease-in-out",
};

const closeButtonStyle = {
  position: "absolute",
  top: "10px",
  right: "10px",
  background: "#fff",
  border: "2px solid #ddd",
  borderRadius: "50%",
  width: "32px",
  height: "32px",
  fontSize: "20px",
  fontWeight: "bold",
  color: "#333",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
  transition: "background 0.2s",
};

export default GlobeWithMarkers;
