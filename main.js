/* OGD Wien Beispiel */

let stephansdom = {
    lat: 48.208493,
    lng: 16.373118,
    title: "Stephansdom"
};

let startLayer = L.tileLayer.provider("BasemapAT.grau");

let map = L.map("map", {
    center: [stephansdom.lat, stephansdom.lng],
    zoom: 16,
    layers: [
        startLayer
    ]
});

let layerControl = L.control.layers({
    "BasemapAT Grau": startLayer,
    "Basemap Standard": L.tileLayer.provider("BasemapAT.basemap"),
    "Basemap High-DPI": L.tileLayer.provider("BasemapAT.highdpi"),
    "Basemap Gelände": L.tileLayer.provider("BasemapAT.terrain"),
    "Basemap Oberfläche": L.tileLayer.provider("BasemapAT.surface"),
    "Basemap Orthophoto": L.tileLayer.provider("BasemapAT.orthofoto"),
    "Basemap Beschriftung": L.tileLayer.provider("BasemapAT.overlay"),

    "Basemap mit Orthophoto und Beschriftung": L.layerGroup([
        L.tileLayer.provider("BasemapAT.orthofoto"),
        L.tileLayer.provider("BasemapAT.overlay"),
    ]),
}).addTo(map);

layerControl.expand();

/*
let sightLayer = L.featureGroup();

layerControl.addOverlay(sightLayer, "Sehenswürdigkeiten");

let mrk = L.marker([stephansdom.lat, stephansdom.lng]).addTo(sightLayer);

sightLayer.addTo(map);
*/

// Masstab hinzugefügt
L.control.scale({
    imperial: false,
}).addTo(map);

// Fullscreen-Funktion hinzugefügt
L.control.fullscreen().addTo(map);

// Mini-Map einbinden
let miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("BasemapAT"), {
        toggleDisplay: true,
        minimized: true,
    }
).addTo(map);

// Sehenswürdigkeiten
async function loadSites(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    // console.log(geojson);

    let overlay = L.featureGroup()
    layerControl.addOverlay(overlay, "Sehenswürdigkeiten");
    overlay.addTo(map);

    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            //L.marker(latlng).addTo(map)
            //console.log(geoJsonPoint.properties.NAME);
            let popup = `
            <img src="${geoJsonPoint.properties.THUMBNAIL}" alt = ""><br>
            <strong>${geoJsonPoint.properties.NAME}</strong>
            <hr>
            Adresse: ${geoJsonPoint.properties.ADRESSE}<br>
            <a href = ${geoJsonPoint.properties.WEITERE_INF}">Weblink</a>
            `;
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/photo.png",
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            }).bindPopup(popup);
        }
    }).addTo(overlay);
}

// Haltestellen Vienna Sightseeing
async function loadStops(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    // console.log(geojson);

    let overlay = L.featureGroup()
    layerControl.addOverlay(overlay, "Haltestellen Vienna Sightseeing");
    overlay.addTo(map);

    L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            //L.marker(latlng).addTo(map)
            //console.log(geoJsonPoint.properties);
            let popup = `
                <strong>${geoJsonPoint.properties.LINE_NAME}</strong><br>
                Station: ${geoJsonPoint.properties.STAT_NAME}
            `;
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: `icons/bus_${geoJsonPoint.properties.LINE_ID}.png`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37]
                })
            }).bindPopup(popup);
        }
    }).addTo(overlay);
}

// Liniennetz Vienna Sightseeing
async function loadLines(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    // console.log(geojson);

    let overlay = L.featureGroup()
    layerControl.addOverlay(overlay, "Liniennetz Vienna Sightseeing");
    overlay.addTo(map);

    L.geoJSON(geojson, {
        style: function (feature) {
            //console.log(feature)

            let colors = {
                "Red Line": "#FF4136",
                "Yellow Line": "#FFDC00",
                "Blue Line": "#0074D9",
                "Green Line": "#2ECC40",
                "Grey Line": "#AAAAAA",
                "Orange Line": "#FF851B"
            };

            return {
                color: `${colors[feature.properties.LINE_NAME]}`,
                weight: 4,
                dashArray: [10, 6]
            }
        }
    }).bindPopup(function (layer) {
        return `
        <h4>${layer.feature.properties.LINE_NAME}</h4>
        von: ${layer.feature.properties.FROM_NAME}
        <br>
        nach: ${layer.feature.properties.TO_NAME}
        `;
        //return layer.feature.properties.LINE_NAME;
    }).addTo(overlay);
}

// Fußgängerzonen Wien
async function loadZones(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    // console.log(geojson);

    let overlay = L.featureGroup()
    layerControl.addOverlay(overlay, "Fußgängerzonen Wien");
    overlay.addTo(map);

    L.geoJSON(geojson, {
            style: function (feature) {
                //console.log(feature)
                return {
                    //color: `${colors[feature.properties.LINE_NAME]}`,
                    color: "#F012BE",
                    weight: 1,
                    opacity: 0.1,
                    fillOpacity: 0.1
                }
            }
        }

    ).bindPopup(function (layer) {
        return `
        <h4>Fußgägnerzone: ${layer.feature.properties.ADRESSE}</h4>
        <p>${layer.feature.properties.ZEITRAUM || ""}</p>
        <p>${layer.feature.properties.AUSN_TEXT || ""}</p>
        `;
    }).addTo(overlay);
}
// || entspricht oder, also wenn Feld "null" ist.

// Hotels und Unterkünfte
async function loadHotels(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    console.log(geojson);

    /*Workload 6: Franz Gatt
    
    ADRESSE: "04., Wiedner Hauptstraße 27-29"
    BETRIEB: "Erzherzog Rainer - Schick Hotels"
    BETRIEBSART: "H"
    BETRIEBSART_TXT: "Hotel"
    BEZIRK: 4
    KATEGORIE_TXT: "4*"
    KONTAKT_EMAIL: "rainer@schick-hotels.com"
    KONTAKT_TEL: "+43 1 221 11"
    OBJECTID: 182577
    SE_ANNO_CAD_DATA: null
    WEBLINK1: "www.hotelerzherzograiner.wien"
    das Popup soll den Namen des Betriebs, Betriebsart, Kategorie, Adresse, Telefonnummer sowie zwei Links zur E-Mailadresse und zur Homepage enthalten
    
    let statusColor;
    if (hut.open == true) {
        statusColor = "green";
    } else {
        statusColor = "red";
    }

    L.circleMarker([hut.lat, hut.lng], {
        color: statusColor,
        radius: 50,
    }).addTo(map).bindPopup(popup);

    mit einer if, else if, else Abfrage des Attributs BETRIEBSART sollt ihr das passende Icon ermitteln und verwenden. Unterschieden wird zwischen:
    H - Hotel, Farbe PURPLE - #B10DC9, Icon hotel_0star
    P - Pension, Farbe PURPLE - #B10DC9, Icon lodging_0star
    A Appartment, Farbe PURPLE - #B10DC9, Icon apartment-2
    */

    let overlay = L.markerClusterGroup({
        diableClusteringAtZoom: 17
    });
    layerControl.addOverlay(overlay, "Hotels und Unterkünfte");
    overlay.addTo(map);

    let hotelsLayer = L.geoJSON(geojson, {
        pointToLayer: function (geoJsonPoint, latlng) {
            //L.marker(latlng).addTo(map)
            let searchList = document.querySelector("#searchList");
            searchList.innerHTML += `<option value="${geoJsonPoint.properties.BETRIEB}"></option>`;
            //console.log(document.querySelector("#searchList"))
            //console.log(`<option value="${geoJsonPoint.properties.BETRIEB}"></option>`);

            let popup = `
                <strong>${geoJsonPoint.properties.BETRIEB}</strong><br>
                Betriebsart: ${geoJsonPoint.properties.BETRIEBSART_TXT}<br>
                Kategorie: ${geoJsonPoint.properties.KATEGORIE_TXT}<br>
                Adresse: ${geoJsonPoint.properties.ADRESSE}<br>
                Telefonnummer: ${geoJsonPoint.properties.KONTAKT_TEL}<br>
                E-Mail: <a href ="mailto:${geoJsonPoint.properties.KONTAKT_EMAIL}">${geoJsonPoint.properties.KONTAKT_EMAIL}</a><br>
                Link zur <a href = "${geoJsonPoint.properties.WEBLINK1}">Homepage</a>
            `;
            if (geoJsonPoint.properties.BETRIEBSART == "H") {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: `icons/hotel_0star.png`,
                        iconAnchor: [16, 37],
                        popupAnchor: [0, -37]
                    })
                }).bindPopup(popup);
            } else if (geoJsonPoint.properties.BETRIEBSART == "P") {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: `icons/lodging_0star.png`,
                        iconAnchor: [16, 37],
                        popupAnchor: [0, -37]
                    })
                }).bindPopup(popup);
            } else {
                return L.marker(latlng, {
                    icon: L.icon({
                        iconUrl: `icons/apartment-2.png`,
                        iconAnchor: [16, 37],
                        popupAnchor: [0, -37]
                    })
                }).bindPopup(popup);
            }
        }
    }).addTo(overlay);

// Button mit searchForm verknüpft
    let form = document.querySelector("#searchForm");
    console.log(form.hotel);
    form.suchen.onclick = function() {
        console.log(form.hotel.value);
        hotelsLayer.eachLayer(function(marker){
            //console.log(marker)

            if(form.hotel.value == marker.feature.properties.BETRIEB){
                //console.log(marker.getLatLng())
                map.setView(marker.getLatLng(), 17)
                marker.openPopup();
                //console.log(marker.getPopup())
                //console.log(marker.feature.properties.BETRIEB)
            }
        })
    }
}

loadSites("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:SEHENSWUERDIGOGD&srsName=EPSG:4326&outputFormat=json");
loadStops("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKHTSVSLOGD&srsName=EPSG:4326&outputFormat=json");
loadLines("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:TOURISTIKLINIEVSLOGD&srsName=EPSG:4326&outputFormat=json");
loadZones("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:FUSSGEHERZONEOGD&srsName=EPSG:4326&outputFormat=json");
loadHotels("https://data.wien.gv.at/daten/geo?service=WFS&request=GetFeature&version=1.1.0&typeName=ogdwien:UNTERKUNFTOGD&srsName=EPSG:4326&outputFormat=json");