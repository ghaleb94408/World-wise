import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvent,
} from "react-leaflet";
import styles from "./Map.module.css";
import { useCities } from "../contexts/CitiesContext";
import useGeolocation from "../hooks/useGeoLocation";
import Button from "./Button";
import useUrlPosition from "../hooks/useUrlPosition";
export default function Map() {
  const [mapPosition, setMapPosition] = useState([40, 0]);
  // eslint-disable-next-line no-unused-vars
  const [mapLat, mapLng, searchParams, setSearchParams] = useUrlPosition();
  // const mapLat = searchParams.get("lat");
  // const mapLng = searchParams.get("lng");
  const {
    isLoading: isLoadingPosition,
    position: geoLoactionPosition,
    getPosition,
  } = useGeolocation();
  const { cities } = useCities();
  useEffect(
    function () {
      if ((mapLat, mapLng)) setMapPosition([mapLat, mapLng]);
    },
    [mapLat, mapLng]
  );
  useEffect(
    function () {
      if (geoLoactionPosition) {
        setMapPosition([geoLoactionPosition.lat, geoLoactionPosition.lng]);
      }
    },
    [geoLoactionPosition]
  );
  return (
    <div className={styles.mapContainer}>
      {!geoLoactionPosition && (
        <Button type="position" onClick={getPosition}>
          {isLoadingPosition ? "Loading" : "Use Your Position"}
        </Button>
      )}
      <MapContainer
        center={mapPosition}
        zoom={13}
        scrollWheelZoom={true}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {cities.map((city) => {
          return (
            <Marker
              key={city.id}
              position={[city.position.lat, city.position.lng]}
            >
              <Popup>
                <span>{city.emoji}</span>
                <span>{city.cityName}</span>
              </Popup>
            </Marker>
          );
        })}
        <ChangeCenter position={mapPosition} />
        <DetectClick />
      </MapContainer>
    </div>
  );
}
// eslint-disable-next-line react/prop-types
function ChangeCenter({ position }) {
  const map = useMap();
  map.setView(position);
  return null;
}
function DetectClick() {
  const navigate = useNavigate();

  useMapEvent({
    click: (e) =>
      navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`, {
        replace: true,
      }),
  });
}
