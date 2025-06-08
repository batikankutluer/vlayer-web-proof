#!/bin/bash
# Sadece .js dosyalarını .mjs'ye çevir ve import pathlerini düzelt
for file in ./dist/esm/*.js; do
  echo "Updating $file contents..."
  # Import pathlerinde .js uzantıları ekle
  sed -i "s/from '\.\([^']*\)'/from '.\1.js'/g" "$file"
  # .js'leri .mjs'ye çevir
  sed -i "s/\.js'/\.mjs'/g" "$file"
  echo "Renaming $file to ${file%.js}.mjs..."
  mv "$file" "${file%.js}.mjs"
done