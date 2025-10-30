for port in {3000..3010}; do
  if curl --output /dev/null --silent --head --fail "http://localhost:$port"; then
    echo "Frontend found on port $port"
    exit 0
  fi
done

echo "No running frontend found in ports 3000-3010"
