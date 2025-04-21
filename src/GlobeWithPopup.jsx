/** @format */

import React, { useRef, useEffect, useState } from "react";
import Globe from "react-globe.gl";
import locationData from "./data/data.json";

const GlobeWithMarkers = () => {
  const globeRef = useRef();
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [markerElements, setMarkerElements] = useState(new Map());

  const markerSvg = `<svg viewBox="-4 0 36 36">
    <path fill="currentColor" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"></path>
    <circle fill="black" cx="14" cy="14" r="7"></circle>
  </svg>`;

  // Transform only first 100 data points
  const markerData = locationData.slice(0, 100).map((location) => ({
    id: location.id,
    lat: location.lat,
    lng: location.long,
    size: 25, // Fixed size for all markers
    title: location.city,
    description: `Location in ${location.city}`,
    image:
      location.images && location.images.length > 0
        ? location.images[0]
        : `https://picsum.photos/400/200?random=${location.id}`,
  }));

  useEffect(() => {
    globeRef.current.controls().autoRotate = false; // Changed from true to false
    globeRef.current.controls().autoRotateSpeed = 0; // Changed from 0.4 to 0
  }, []);

  const handleMarkerClick = (d) => {
    const controls = globeRef.current.controls();
    if (controls.autoRotate) {
      controls.autoRotate = false;
      controls.update();
    }

    // Reset all markers to red
    markerElements.forEach((el) => {
      el.style.color = "red";
    });

    // Set clicked marker to blue
    const clickedElement = markerElements.get(d.id);
    if (clickedElement) {
      clickedElement.style.color = "blue";
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
      // Reset all markers to red when closing popup
      markerElements.forEach((el) => {
        el.style.color = "red";
      });
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
          el.style.color = "red"; // Default color is red
          el.style.width = `${d.size}px`;
          el.style.transition = "all 0.3s ease-in-out";
          el.style.pointerEvents = "auto";
          el.style.cursor = "pointer";

          el.onclick = () => handleMarkerClick(d);

          // Store reference to the element
          setMarkerElements((prev) => new Map(prev).set(d.id, el));
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
              onClick={() => {
                setSelectedMarker(null);
                // Reset all markers to red when closing popup
                markerElements.forEach((el) => {
                  el.style.color = "red";
                });
              }}
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
