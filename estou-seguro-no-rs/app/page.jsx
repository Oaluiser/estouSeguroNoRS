import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import { GoogleMap, LoadScript } from "@react-google-maps/api";
import { useState, useEffect } from "react";
import csv from 'csv-parser';
import fs from 'fs';

const mapStyles = { height: "60vh", width: "100%" };
const defaultCenter = { lat: -31.7654, lng: -52.3376 };
const libraries = ["places"];

function parsePolygonWKT(wkt) {
  const coordinateStrings = wkt
    .replace("POLYGON ((", "")
    .replace("))", "")
    .split(", ");

  return coordinateStrings.map(coordStr => {
    const [lng, lat] = coordStr.split(" ").map(Number);
    return { lat, lng };
  });
}

const Home = () => {
  const [address, setAddress] = useState("");
  const [polygons, setPolygons] = useState([]);
  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };
  const currentDate = new Date();
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete();
  const handleSelect = async (description) => {
    setValue(description, false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      console.log(lat, lng);
    } catch (error) {
      console.log("Error: ", error);
    }
  };

  useEffect(() => {
    const polygons = [];
    fs.createReadStream('poligon.csv')
      .pipe(csv())
      .on('data', (row) => {
        const polygon = parsePolygonWKT(row.WKT);
        polygons.push(polygon);
      })
      .on('end', () => {
        setPolygons(polygons);
      });
  }, []);

  return (
    <main className="flex flex-col justify-between h-screen bg-gray-200 text-black">
      <div className="flex flex-col items-center justify-center flex-grow mx-5 mt-5">
        <h1 className="text-2xl">
          Coloque seu endereço e descubra qual a situação da sua região:
        </h1>
        <div className="relative">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={!ready}
            placeholder="Digite seu endereço aqui"
            className="mt-5 p-2 border-2 border-gray-300 rounded-md bg-white text-black"
          />
          {status === "OK" &&
            data.map(({ place_id, description }) => (
              <div
                key={place_id}
                onClick={() => handleSelect(description)}
                className="absolute bg-white w-full border border-gray-300 rounded-md z-10"
              >
                {description}
              </div>
            ))}
        </div>
      </div>
      <div className="mx-5">
        <LoadScript
          googleMapsApiKey="api aqui"
          libraries={libraries as Libraries}
        >
          <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={13}
            center={defaultCenter}
          >
          </GoogleMap>
        </LoadScript>
      </div>
      <footer className="text-left m-5">
        <h2 className="text-xl font-semibold">Cidades cobertas:</h2>
        <div>Pelotas - Ultima atualização: 7/5/2024, 16:33</div>
      </footer>
    </main>
  )
}

export default Home
