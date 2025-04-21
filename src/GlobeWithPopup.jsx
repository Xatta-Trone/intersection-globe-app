/** @format */
import React, { useRef, useEffect, useState, useMemo } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";
import locationData from "./data/data.json";

const GlobeWithPinMarkers = () => {
  const globeRef = useRef();
  const [pinTexture, setPinTexture] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(null);

  const markerData = useMemo(
    () =>
      locationData
        .filter(
          (location) =>
            isFinite(location.lat) &&
            isFinite(location.long) &&
            Math.abs(location.lat) <= 90 &&
            Math.abs(location.long) <= 180
        )
        .map((location) => ({
          id: location.id,
          lat: location.lat,
          lng: location.long,
          city: location.city,
          images:
            location.images && location.images.length > 0
              ? location.images.map(
                  (img) =>
                    `https://raw.githubusercontent.com/Xatta-Trone/ait-lab-data-images/main/${img}`
                )
              : [`https://picsum.photos/400/200?random=${location.id}`],
        })),
    []
  );

  console.log(markerData);

  // Convert SVG to canvas texture once
  useEffect(() => {
    const svg = `<svg width="30" height="40" viewBox="-4 0 36 36" xmlns="http://www.w3.org/2000/svg">
      <path fill="red" d="M14,0 C21.732,0 28,5.641 28,12.6 C28,23.963 14,36 14,36 C14,36 0,24.064 0,12.6 C0,5.641 6.268,0 14,0 Z"/>
      <circle fill="black" cx="14" cy="14" r="7"/>
    </svg>`;

    const img = new Image();
    const canvas = document.createElement("canvas");
    canvas.width = 40;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const texture = new THREE.CanvasTexture(canvas);
      setPinTexture(texture);
    };

    img.src = "data:image/svg+xml;base64," + btoa(svg);
  }, []);

  // Safe control initialization
  useEffect(() => {
    const checkControls = () => {
      if (globeRef.current && globeRef.current.controls) {
        const controls = globeRef.current.controls();
        controls.autoRotate = false;
        controls.autoRotateSpeed = 0;
      } else {
        requestAnimationFrame(checkControls);
      }
    };
    checkControls();
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        position: "relative",
        background: "#000",
      }}
    >
      {pinTexture && (
        <Globe
          ref={globeRef}
          globeImageUrl="//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg"
          backgroundColor="black"
          showAtmosphere
          atmosphereAltitude={0.15}
          objectsData={markerData}
          objectLat={(d) => d.lat}
          objectLng={(d) => d.lng}
          objectAltitude={() => 0.01}
          objectThreeObject={() => {
            const spriteMaterial = new THREE.SpriteMaterial({
              map: pinTexture,
              depthWrite: false,
            });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(0.5, 0.7, 1); // size of pin
            sprite.center.set(0.5, 1); // anchor pin tip to the point
            return sprite;
          }}
          onObjectClick={(d) => {
            globeRef.current.pointOfView(
              { lat: d.lat, lng: d.lng, altitude: 1.5 },
              1000
            );
            setTimeout(() => setSelectedMarker(d), 1200);
          }}
        />
      )}

      {selectedMarker && (
        <div
          id="modal-overlay"
          style={modalOverlayStyle}
          onClick={(e) => {
            if (e.target.id === "modal-overlay") {
              setSelectedMarker(null);
            }
          }}
        >
          <div style={modalStyle}>
            <button
              style={closeButtonStyle}
              onClick={() => setSelectedMarker(null)}
            >
              &times;
            </button>
            <h2 style={{ marginBottom: "10px" }}>{selectedMarker.city}</h2>
            <p style={{ fontSize: "14px", color: "#555" }}>
              Location in {selectedMarker.city}
            </p>
            <div style={imageGridStyle}>
              {selectedMarker.images.map((img, idx) => {
                const fileName = img.split("/").pop().split(".")[0]; // remove folder & extension

                return (
                  <div key={idx} style={{ textAlign: "center" }}>
                    <img
                      src={img}
                      alt={fileName}
                      style={{
                        width: "100%",
                        borderRadius: "8px",
                        objectFit: "cover",
                        marginBottom: "5px",
                      }}
                    />
                    <div style={{ fontSize: "12px", color: "#555" }}>
                      {fileName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 🌟 Modal Styles (unchanged)
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
};

const imageGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
  marginBottom: "15px",
};

export default GlobeWithPinMarkers;
