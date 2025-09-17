#!/bin/bash
 
# Script to create 500 orders with various German locations
# Usage: ./create_orders.sh
 
API_URL="http://localhost:5119/api/orders"
 
# Arrays of German cities with coordinates
declare -a CITIES=(
    "Berlin:52.5200:13.4050:10178"
    "München:48.1351:11.5820:80339"
    "Hamburg:53.5511:9.9937:20457"
    "Köln:50.9375:6.9603:50667"
    "Frankfurt am Main:50.1109:8.6821:60549"
    "Stuttgart:48.7758:9.1829:70190"
    "Düsseldorf:51.2277:6.7735:40474"
    "Dortmund:51.5136:7.4653:44135"
    "Essen:51.4556:7.0116:45127"
    "Leipzig:51.3397:12.3731:04109"
    "Bremen:53.0793:8.8017:28195"
    "Dresden:51.0504:13.7373:01067"
    "Hannover:52.3759:9.7320:30159"
    "Nürnberg:49.4521:11.0767:90403"
    "Duisburg:51.4344:6.7623:47051"
    "Bochum:51.4819:7.2162:44787"
    "Wuppertal:51.2562:7.1508:42103"
    "Bielefeld:52.0302:8.5325:33602"
    "Bonn:50.7374:7.0982:53111"
    "Münster:51.9607:7.6261:48143"
    "Karlsruhe:49.0069:8.4037:76131"
    "Mannheim:49.4875:8.4660:68159"
    "Augsburg:48.3705:10.8978:86150"
    "Wiesbaden:50.0782:8.2398:65183"
    "Gelsenkirchen:51.5177:7.0857:45879"
    "Mönchengladbach:51.1805:6.4428:41061"
    "Braunschweig:52.2689:10.5268:38100"
    "Chemnitz:50.8279:12.9214:09111"
    "Kiel:54.3233:10.1228:24103"
    "Aachen:50.7753:6.0839:52062"
    "Halle:51.4825:11.9697:06108"
    "Magdeburg:52.1205:11.6276:39104"
    "Freiburg:47.9990:7.8421:79098"
    "Krefeld:51.3388:6.5853:47798"
    "Lübeck:53.8654:10.6865:23552"
    "Oberhausen:51.4963:6.8521:46045"
    "Erfurt:50.9848:11.0299:99084"
    "Mainz:50.0000:8.2711:55116"
    "Rostock:54.0887:12.1380:18055"
    "Kassel:51.3127:9.4797:34117"
    "Hagen:51.3670:7.4637:58095"
    "Potsdam:52.3906:13.0645:14467"
    "Saarbrücken:49.2401:7.0662:66111"
    "Hamm:51.6806:7.8200:59065"
    "Mülheim:51.4266:6.8837:45468"
    "Ludwigshafen:49.4771:8.4454:67059"
    "Leverkusen:51.0459:7.0192:51373"
    "Oldenburg:53.1435:8.2146:26121"
    "Osnabrück:52.2799:8.0472:49074"
    "Solingen:51.1652:7.0679:42651"
)
 
# Arrays of articles
declare -a ARTICLES=(
    "Elektronikkomponenten:Hochwertige Platinen für Industrieanlagen:145.5:0.8"
    "Automobilteile:Bremsscheiben für Fahrzeugproduktion:890.2:2.1"
    "Medizintechnik:Präzisionsinstrumente für Chirurgie:67.8:0.3"
    "Lebensmittel:Bio-Frischprodukte regional:234.7:1.5"
    "Maschinenbauteile:CNC-gefräste Komponenten:1250.0:3.2"
    "Pharmazeutika:Temperaturkontrollierte Medikamente:89.4:0.4"
    "Textilien:Hochwertige Baumwollstoffe:156.3:2.8"
    "Chemikalien:Industrielle Lösungsmittel:445.6:1.9"
    "Möbelkomponenten:Massivholz-Tischplatten:678.9:4.1"
    "Elektronikgeräte:Laptop-Computer B2B:89.7:0.6"
    "Metallwaren:Edelstahl-Rohrleitungen:567.8:2.3"
    "Kosmetikprodukte:Premium-Pflegeserie:78.2:0.9"
    "Sportartikel:Fitness-Equipment professionell:234.5:1.7"
    "Büromaterial:Professionelle Druckerpapiere:123.4:1.1"
    "Werkzeuge:Präzisions-Messgeräte:345.6:0.7"
    "Verpackungen:Kartonagen für Versandhandel:45.8:3.5"
    "Glaswaren:Laborglas für Forschung:189.7:1.2"
    "Kunststoffteile:Spritzguss-Komponenten:267.3:2.0"
    "Bauchemie:Spezialbeton-Additive:789.1:2.6"
    "Solartechnik:Photovoltaik-Module:445.2:3.8"
)
 
# Arrays of carriers
declare -a CARRIERS=(
    "DHL Supply Chain:logistics@dhl.de:+49-228-182-0"
    "DB Schenker:operations@dbschenker.com:+49-201-878-01"
    "Kuehne+Nagel:service@kuehne-nagel.com:+49-40-30333-0"
    "DPD Deutschland:info@dpd.de:+49-6021-843-0"
    "UPS Deutschland:service@ups.com:+49-69-6634-0"
    "FedEx Express:customerservice@fedex.com:+49-800-123-8000"
    "GLS Germany:info@gls-group.eu:+49-6677-646-0"
    "Hermes Logistik:service@hermesworld.com:+49-40-593-0"
    "Trans-o-flex:info@tof.de:+49-6196-777-0"
    "Gebrüder Weiss:office@gw-world.com:+49-7542-939-0"
    "Dachser:info@dachser.com:+49-8331-982-0"
    "LKW Walter:office@lkw-walter.com:+43-7477-701-0"
    "Krone Logistics:info@krone-trailer.com:+49-5951-209-0"
    "Rhenus Logistics:info@rhenus.com:+49-2102-99-0"
    "FIEGE Logistik:info@fiege.com:+49-2572-928-0"
    "BLG Logistics:info@blg.de:+49-421-398-0"
    "Nagel-Group:info@nagel-group.com:+49-6676-729-0"
    "Mosolf Logistics:info@mosolf.de:+49-7141-403-0"
    "Vos Logistics:info@vos.nl:+31-77-389-2000"
    "CEVA Logistics:info@cevalogistics.com:+49-6102-2909-0"
)
 
# Function to get random element from array
get_random_element() {
    local array=("$@")
    local size=${#array[@]}
    local index=$((RANDOM % size))
    echo "${array[$index]}"
}
 
# Function to generate random order number
generate_order_no() {
    echo "EXT-2025-$(printf "%07d" $((1000000 + RANDOM % 9000000)))"
}
 
# Function to generate random quantity
generate_quantity() {
    echo $((1 + RANDOM % 100))
}
 
# Function to generate random planned times
generate_times() {
    local base_date="2025-09-$(printf "%02d" $((18 + RANDOM % 10)))"
    local departure_hour=$(printf "%02d" $((RANDOM % 24)))
    local departure_min=$(printf "%02d" $((RANDOM % 60)))
    local arrival_hour=$(printf "%02d" $(((departure_hour + 8 + RANDOM % 16) % 24)))
    local arrival_min=$(printf "%02d" $((RANDOM % 60)))
    
    echo "${base_date}T${departure_hour}:${departure_min}:00Z ${base_date}T${arrival_hour}:${arrival_min}:00Z"
}
 
# Function to create order JSON
create_order() {
    local order_no=$(generate_order_no)
    local quantity=$(generate_quantity)
    
    # Get random start and destination cities
    local start_city_data=$(get_random_element "${CITIES[@]}")
    local dest_city_data=$(get_random_element "${CITIES[@]}")
    
    # Ensure start and destination are different
    while [ "$start_city_data" = "$dest_city_data" ]; do
        dest_city_data=$(get_random_element "${CITIES[@]}")
    done
    
    # Parse city data
    IFS=':' read -r start_city start_lat start_lng start_postal <<< "$start_city_data"
    IFS=':' read -r dest_city dest_lat dest_lng dest_postal <<< "$dest_city_data"
    
    # Get random article and carrier
    local article_data=$(get_random_element "${ARTICLES[@]}")
    local carrier_data=$(get_random_element "${CARRIERS[@]}")
    
    # Parse article data
    IFS=':' read -r article_name article_desc article_weight article_volume <<< "$article_data"
    
    # Parse carrier data
    IFS=':' read -r carrier_name carrier_email carrier_phone <<< "$carrier_data"
    
    # Generate times
    local times=$(generate_times)
    local departure_time=$(echo $times | cut -d' ' -f1)
    local arrival_time=$(echo $times | cut -d' ' -f2)
    
    # Generate random street addresses
    local start_street="$(get_random_element "Industriestraße" "Gewerbepark" "Hafenstraße" "Logistikzentrum" "Cargo Center")"
    local start_house_no="$((1 + RANDOM % 200))"
    local dest_street="$(get_random_element "Gewerbering" "Fabrikstraße" "Technologiepark" "Businesspark" "Handelsstraße")"
    local dest_house_no="$((1 + RANDOM % 150))"
    
    # Create JSON
    cat << EOF
{
  "extOrderNo": "$order_no",
  "quantity": $quantity,
  "article": {
    "name": "$article_name",
    "description": "$article_desc",
    "weight": $article_weight,
    "volume": $article_volume
  },
  "carrier": {
    "name": "$carrier_name",
    "contactEmail": "$carrier_email",
    "contactPhone": "$carrier_phone"
  },
  "startLocation": {
    "city": "$start_city",
    "street": "$start_street",
    "houseNo": "$start_house_no",
    "postCode": "$start_postal",
    "latitude": $start_lat,
    "longitude": $start_lng
  },
  "destinationLocation": {
    "city": "$dest_city",
    "street": "$dest_street",
    "houseNo": "$dest_house_no",
    "postCode": "$dest_postal",
    "latitude": $dest_lat,
    "longitude": $dest_lng
  },
  "plannedDeparture": "$departure_time",
  "plannedArrival": "$arrival_time",
  "stopps": []
}
EOF
}
 
# Main execution
echo "Creating 500 orders..."
echo "API URL: $API_URL"
echo ""
 
success_count=0
error_count=0
 
for i in {1..500}; do
    echo -n "Creating order $i/500... "
    
    # Generate order JSON
    order_json=$(create_order)
    
    # Send POST request
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -d "$order_json" \
        "$API_URL" 2>/dev/null)
    
    # Extract HTTP status code (last line)
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo "✅ Success (HTTP $http_code)"
        ((success_count++))
    else
        echo "❌ Failed (HTTP $http_code)"
        ((error_count++))
        # Uncomment to see error details:
        # echo "$response" | head -n -1
    fi
    
    # Small delay to avoid overwhelming the server
    sleep 0.1
done
 
echo ""
echo "=== Summary ==="
echo "Total orders attempted: 500"
echo "Successful: $success_count"
echo "Failed: $error_count"
echo ""
 
if [ $error_count -gt 0 ]; then
    echo "⚠️  Some orders failed. Check if the API server is running at $API_URL"
else
    echo "🎉 All orders created successfully!"
fi