import React, { useRef, useEffect, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import { fromLonLat } from "ol/proj";
import Overlay from "ol/Overlay";

export default function HomeMap({ }) {
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const [popupContent, setPopupContent] = useState("");
  const [popupPosition, setPopupPosition] = useState(null);

  const markerData = [
    { id: 1, name: "Location A", coordinates: [-0.09, 51.505] },
    { id: 2, name: "Location B", coordinates: [-0.08, 51.51] },
    { id: 3, name: "Location C", coordinates: [-0.07, 51.515] },
  ];

  useEffect(() => {
    const map = new Map({
      target: mapRef.current!,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([-0.09, 51.505]),
        zoom: 13,
      }),
    });

    markerData.forEach((marker) => {
      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.innerHTML = `<img src="https://img.icons8.com/color/48/000000/marker.png" alt="${marker.name}" />`;

      markerElement.addEventListener("click", () => {
        setPopupContent(marker.name);
        setPopupPosition(fromLonLat(marker.coordinates));
      });

      const overlay = new Overlay({
        position: fromLonLat(marker.coordinates),
        positioning: "center-center",
        element: markerElement,
      });
      map.addOverlay(overlay);
    });

    const popupOverlay = new Overlay({
      element: popupRef.current,
      positioning: "bottom-center",
      stopEvent: false,
      offset: [0, -10],
    });
    map.addOverlay(popupOverlay);

    if (popupPosition) {
      popupOverlay.setPosition(popupPosition);
    } else {
      popupOverlay.setPosition(undefined);
    }

    return () => map.setTarget(null);
  }, [popupPosition]);

  return (
    <>
      <div ref={mapRef} className="w-full md:h-72 min-h-96" />

      {/* Popup element */}
      <div ref={popupRef} className="popup">
        {popupContent}
      </div>

      {/* Inline CSS for custom styling */}
      <style>{`
        .custom-marker img {
          width: 32px;
          height: 32px;
          cursor: pointer;
        }
        .popup {
          background: white;
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          white-space: nowrap;
          pointer-events: none;
        }
      `}</style>
    </>
  );
}
