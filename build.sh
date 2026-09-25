#!/usr/bin/env bash
# Rebuild index.html from the raw OSM boundaries in data/raw/.
# Needs: python3 with shapely (pip install -r requirements.txt), node (npm install).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p build
python3 scripts/build_geo.py "$@"
npx mapshaper build/all.geojson -simplify 4% weighted keep-shapes \
  -proj '+proj=aea +lat_1=38 +lat_2=50 +lat_0=44 +lon_0=66 +datum=WGS84 +units=m' \
  -o format=geojson precision=10 build/proj.geojson
python3 scripts/build_data.py
python3 scripts/assemble.py
echo "Built index.html"
