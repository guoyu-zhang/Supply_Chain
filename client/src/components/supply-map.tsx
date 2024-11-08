import React, { useRef, useEffect, useState } from "react";
import "ol/ol.css";
import { Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { LineString, Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { Style, Stroke, Icon } from "ol/style";
import Overlay from "ol/Overlay";
import OSM from "ol/source/OSM";
import Feature from "ol/Feature";

export default function AnimatedSupplyMap({locations}) {
  const mapRef = useRef(null);
  const popupRef = useRef(null);
  const [popupContent, setPopupContent] = useState("");
  const [popupPosition, setPopupPosition] = useState(null);
  console.log("shjdgjhasg")
  console.log(locations)
  // const markerData = [
  //   { id: 1, name: "New York, USA", coordinates: [-74.006, 40.7128] },
  //   { id: 2, name: "London, UK", coordinates: [-0.1276, 51.5074] },
  //   { id: 3, name: "Tokyo, Japan", coordinates: [139.6917, 35.6895] },
  //   { id: 4, name: "Berlin, Germany", coordinates: [13.405, 52.52] },
  //   { id: 5, name: "Sydney, Australia", coordinates: [151.2093, -33.8688] },
  //   {
  //     id: 6,
  //     name: "Cape Town, South Africa",
  //     coordinates: [18.4241, -33.9249],
  //   },
  // ];

  const routeData = []

  for (let i = 1; i < locations.length; i++){
    routeData.push({from: locations[i], to:locations[0]})
  }

  // const routeData = [
  //   { from: markerData[0].coordinates, to: markerData[1].coordinates }, // New York -> London
  //   { from: markerData[1].coordinates, to: markerData[2].coordinates }, // London -> Tokyo
  //   { from: markerData[2].coordinates, to: markerData[3].coordinates }, // Tokyo -> Berlin
  //   { from: markerData[3].coordinates, to: markerData[4].coordinates }, // Berlin -> Sydney
  //   { from: markerData[4].coordinates, to: markerData[5].coordinates }, // Sydney -> Cape Town
  //   { from: markerData[5].coordinates, to: markerData[0].coordinates }, // Cape Town -> New York
  // ];

  useEffect(() => {
    const map = new Map({
      target: mapRef.current!,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: fromLonLat([0, 20]),
        zoom: 2,
      }),
    });

    // Markers for each location
    locations.forEach((marker) => {
      const markerElement = document.createElement("div");
      markerElement.className = "custom-marker";
      markerElement.innerHTML = `<img src="https://img.icons8.com/color/48/000000/marker.png" alt="${marker.name}" />`;

      markerElement.addEventListener("click", () => {
        setPopupContent(marker.name);
        setPopupPosition(fromLonLat(marker));
      });

      const overlay = new Overlay({
        position: fromLonLat(marker),
        positioning: "center-center",
        element: markerElement,
      });
      map.addOverlay(overlay);
    });

    // Define vector source and layer for routes
    const routeSource = new VectorSource();
    routeData.forEach((route) => {
      const routeFeature = new Feature({
        geometry: new LineString([
          fromLonLat(route.from),
          fromLonLat(route.to),
        ]),
      });
      routeSource.addFeature(routeFeature);
    });

    const routeLayer = new VectorLayer({
      source: routeSource,
      style: new Style({
        stroke: new Stroke({
          color: "#ff0000",
          width: 2,
        }),
      }),
    });
    map.addLayer(routeLayer);

    // Animation: Moving point along each route
    routeData.forEach((route) => {
      const [start, end] = [fromLonLat(route.from), fromLonLat(route.to)];
      const movingFeature = new Feature({
        geometry: new Point(start),
      });

      const movingMarkerLayer = new VectorLayer({
        source: new VectorSource({
          features: [movingFeature],
        }),
        style: new Style({
          image: new Icon({
            src: "https://img.icons8.com/fluency/48/000000/box.png",
            scale: 0.5,
          }),
        }),
      });
      map.addLayer(movingMarkerLayer);

      let progress = 0;
      const speed = 0.002; // Adjust for speed of animation

      // Animate marker along the line
      const interval = setInterval(() => {
        progress += speed;
        if (progress >= 1) {
          progress = 0; // Reset for continuous animation loop
        }

        // Interpolate position based on progress
        const currentPos = [
          start[0] + progress * (end[0] - start[0]),
          start[1] + progress * (end[1] - start[1]),
        ];
        movingFeature.getGeometry().setCoordinates(currentPos);
      }, 20);

      // Clean up interval on unmount
      return () => clearInterval(interval);
    });

    // Popup overlay for markers
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
      <div ref={mapRef} className="w-full h-full"></div>

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
