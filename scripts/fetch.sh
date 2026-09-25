#!/usr/bin/env bash
# Download each region's boundary (OSM relation) as GeoJSON into data/raw/.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p data/raw
for id in $(cat data/osm_relation_ids.txt); do
  curl -sf -A "steppe-by-steppe" "https://polygons.openstreetmap.fr/get_geojson.py?id=$id&params=0" -o "data/raw/$id.json"
  echo "fetched $id"
done
