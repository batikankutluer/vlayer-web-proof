for file in *.tgz; do
  if [ -f "$file" ]; then
    echo "Renaming $file to vlayer-web-proof.tgz..."
    mv "$file" "vlayer-web-proof.tgz"
    break
  fi
done