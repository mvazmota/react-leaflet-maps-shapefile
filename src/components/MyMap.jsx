import { useEffect, useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  MapContainer,
  TileLayer,
  LayersControl,
  Marker,
  Popup,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
// Retrieve all Leaflet Default Icon options from CSS, in particular all icon images URL's, to improve compatibility with bundlers and frameworks that modify URL's in CSS.
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { ShapeFile } from "./ShapeFile";
import { TileProviders } from "../lib/TileProviders";
import colorbrewer from "colorbrewer";
import { Button, ProgressBar } from "react-bootstrap";
const fs = require("fs");

const MyMap = (props) => {
  let showOptionsCity = true;
  let center = [40.39, -8.8583];
  let posFigueira = [40.1451, -8.8712];
  let posEriceira = [38.9629, -9.4211];
  let zoom = 7;
  let maxZoom = 12;
  let colorPaletteProgress = colorbrewer.RdYlGn[11];

  // let [zoom, setZoom] = useState(7);

  const [geodata, setGeodata] = useState(null);
  const [map, setMap] = useState(null);
  const [city2, setCity2] = useState(null);
  const [position, setPosition] = useState(
    map ? map.getCenter() : { lat: center[0], lng: center[1] }
  );

  const { BaseLayer, Overlay } = LayersControl;

  // See: https://react-leaflet.js.org/docs/example-external-state/
  const DisplayPosition = (props) => {
    const onClick = useCallback(() => {
      props.map.setView(center, zoom);
    }, [props.map]);

    const onMove = useCallback(() => {
      setPosition(props.map.getCenter());
    }, [props.map]);

    useEffect(() => {
      props.map.on("move", onMove);
      return () => {
        props.map.off("move", onMove);
      };
    }, [props.map, onMove]);

    return (
      <div>
        Marker at (lat, lon): ({position.lat.toFixed(4)},{" "}
        {position.lng.toFixed(4)} )<button onClick={onClick}>reset</button>
      </div>
    );
  };

  const loadFiles = (local) => {
    const url = "https://geo-navsafety.ua.pt/getZip/";
    const urlCompleto=url+local;
    

    
    const options = {
      method: "GET",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
      },
      
    };

    fetch(urlCompleto, options)
      .then((res) => res.blob())
      .then(function (file) {
        var reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = function (buffer) {
          setGeodata({ data: buffer.target.result, name: file.name });
        };
      })
      .catch((error) => console.log(error));
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      layer.bindPopup(
        Object.keys(feature.properties)
          .map(function (k) {
            if (k === "__color__") {
              return;
            }
            return k + ": " + feature.properties[k];
          })
          .join("<br />"),
        {
          maxHeight: 200,
        }
      );
    }
  };

  const style = (feature) => {
    // console.log(feature);
    let profundidade = feature.properties.Z;

    let colorPalette;
    if (profundidade < -12) {
      colorPalette = 11;
    } else if (profundidade >= -12 && profundidade < -11) {
      colorPalette = 10;
    } else if (profundidade >= -11 && profundidade < -10) {
      colorPalette = 9;
    } else if (profundidade >= -10 && profundidade < -9) {
      colorPalette = 8;
    } else if (profundidade >= -9 && profundidade < -8) {
      colorPalette = 7;
    } else if (profundidade >= -8 && profundidade < -7) {
      colorPalette = 6;
    } else if (profundidade >= -7 && profundidade < -6) {
      colorPalette = 5;
    } else if (profundidade >= -6 && profundidade < -5) {
      colorPalette = 4;
    } else if (profundidade >= -5 && profundidade < -4) {
      colorPalette = 3;
    } else if (profundidade >= -4 && profundidade < -3) {
      colorPalette = 2;
    } else if (profundidade >= -3) {
      colorPalette = 1;
    }
    return {
      opacity: 1,
      fillOpacity: 0.7,
      radius: 6,
      weight: 3,
      dashArray: "2",
      // from http://stackoverflow.com/a/15710692
      //color: colorbrewer.Spectral[11][Math.ceil(Math.random() * 1000) % 11],
      color: colorPaletteProgress[colorPalette],
    };
  };


  let ShapeLayers = null;
  if (geodata !== null) {
    ShapeLayers = (
      <Overlay checked name={geodata.name}>
        <ShapeFile
          data={geodata.data}
          style={style}
          onEachFeature={onEachFeature}
        />
      </Overlay>
    );
  }
  let infoAPI = {
    varIdx1: 0,
    varFullName1: "OpenStreetMap Mapnik",
    varUrl1: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    // varAttribution1:
    //   '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  };
  let BaseLayers = (
    <BaseLayer checked key={infoAPI.varIdx1} name={infoAPI.varFullName1}>
      <TileLayer url={infoAPI.varUrl1} />
    </BaseLayer>
  );
  let TileLayers = <TileLayer url={infoAPI.varUrl1} />;

  let menuCity = (
    <div id="menuCity">
      <Button
        id="backBtn"
        className="voltarBtn ms-3"
        onClick={() => {
          setCity();
        }}
      ></Button>
      <Button
        id="infoBtn"
        className="voltarBtn me-6"
        href={
          city2 == "Figueira"
            ? "/InfoGeralFigueira_Waves/"
            : "/InfoGeralEriceira_Waves/"
        }
      ></Button>
      <Button
        id="camBtn"
        className="voltarBtn me-3"
        href={city2 == "Figueira" ? "/camaraFigueira" : "/camaraEriceira"}
      ></Button>
    </div>
  );
 
  let legendaBar = (
    <div id="legendaBar">
      <ProgressBar id="legendaBarMap">
        <ProgressBar now={100 / 9} key={1} label="-11" style={{background: colorPaletteProgress[9]}} />
        <ProgressBar now={100 / 9} key={2} label="-10" style={{background: colorPaletteProgress[8]}}/>
        <ProgressBar now={100 / 9} key={3} label="-9" style={{background: colorPaletteProgress[7]}}/>
        <ProgressBar now={100 / 9} key={4} label="-8" style={{background: colorPaletteProgress[6]}}/>
        <ProgressBar now={100 / 9} key={5} label="-7" style={{background: colorPaletteProgress[5]}}/>
        <ProgressBar now={100 / 9} key={6} label="-6" style={{background: colorPaletteProgress[4]}}/>
        <ProgressBar now={100 / 9} key={7} label="-5" style={{background: colorPaletteProgress[3]}}/>
        <ProgressBar now={100 / 9} key={8} label="-4" style={{background: colorPaletteProgress[2]}}/>
        <ProgressBar now={100 / 9} key={9} label="-3" style={{background: colorPaletteProgress[1]}}/>
      </ProgressBar>
      <span className="descricaoBar">Depth ZH (m)</span>
    </div>
  );

  let markers = (
    <>
      <Marker
        className="markerMap"
        id="markerFigueira"
        position={posFigueira}
        eventHandlers={{
          click: () => {
            console.log("change zoom to Figueira");
            setCity("Figueira");
            // window.location.href = "/homeEriceira";
          },
        }}
      ></Marker>
      <Marker
        id="markerEriceira"
        position={posEriceira}
        eventHandlers={{
          click: () => {
            setCity("Ericeira");

            // window.location.href = "/homeEriceira";
          },
        }}
      ></Marker>
    </>
  );

  const setCity = useCallback(
    (city) => {
      console.log(city);

      if (city == "Figueira") {
        setCity2("Figueira");
        map.setMinZoom(13);
        map.setMaxZoom(18);
        map.setView(posFigueira, 14);
        if (geodata == null) {
          //ir com parametro Figueira
          loadFiles("Figueira");
        }
      } else if (city == "Ericeira") {
        setCity2("Ericeira");
        map.setMinZoom(13);
        map.setMaxZoom(18);
        map.setView(posEriceira, 14);
        if (geodata == null) {
          //ir com parametro Figueira
          loadFiles("Ericeira");
        }
      } else {
        setCity2(null);
        map.setMinZoom(7);
        map.setMaxZoom(14);
        map.setView(center, 7);
      }
    },
    [map]
  );

  useEffect(() => {
    //se quiser ter um ficheiro já carregado por defeito, este codigo tem de estar ativo
    // if (props.city == "Figueira") {
    //   setCity("Figueira")
    // }
  });

  return (
    <>
      {/* {map ? (
        <DisplayPosition
          map={map}
          position={position}
          setPosition={setPosition}
        />
      ) : null} */}
      {city2 ? menuCity : null}
      {city2 ? legendaBar : null}
      <MapContainer
        center={center}
        zoom={zoom}
        maxZoom={maxZoom}
        scrollWheelZoom={true}
        style={{ width: "100vw", height: "100vh" }}
        whenCreated={setMap}
      >
        <LayersControl position="topright">
          {BaseLayers}
          {ShapeLayers}
        </LayersControl>

        {/* <Marker
          position={map !== null ? map.getCenter() : center}
          draggable={true}
          animate={true}
        >
        </Marker> */}
        {city2 ? null : markers}
      </MapContainer>
    </>
  );
};

export default MyMap;
