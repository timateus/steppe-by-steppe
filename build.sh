#!/usr/bin/env bash
# Rebuild index.html from the raw OSM boundaries in data/raw/.
# Needs: python3 with shapely (pip install -r requirements.txt), node (npm install).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p build
python3 scripts/build_geo.py "$@"
# Central Asia map (the 55 core regions)
npx mapshaper build/all.geojson -filter 'core' -simplify 4% weighted keep-shapes \
  -proj '+proj=aea +lat_1=38 +lat_2=50 +lat_0=44 +lon_0=66 +datum=WGS84 +units=m' \
  -o format=geojson precision=10 build/proj_core.geojson
# Secret "Great Steppe" map (all regions)
npx mapshaper build/all.geojson -simplify 2.5% weighted keep-shapes \
  -proj '+proj=aea +lat_1=40 +lat_2=52 +lat_0=46 +lon_0=84 +datum=WGS84 +units=m' \
  -o format=geojson precision=10 build/proj_gs.geojson
python3 scripts/build_data.py
python3 scripts/assemble.py
echo "Built index.html"
