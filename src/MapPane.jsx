import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapPane() {
    return (
        <div className="map-wrapper">
            <MapContainer
                center={[50.4501, 30.5234]} // Centered on Kyiv
                zoom={13}
                zoomControl={false}
                style={{ width: "100%", height: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                    url="https://tiles.stadiamaps.com/tiles/stamen_toner/{z}/{x}/{y}.png"
                />
            </MapContainer>
        </div>
    )
}