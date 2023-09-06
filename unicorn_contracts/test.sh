ApiUrl="https://kjki27n5gd.execute-api.ap-southeast-2.amazonaws.com/Local/"

echo "${ApiUrl}contracts" 
echo ""


curl --location --request POST 'https://kjki27n5gd.execute-api.ap-southeast-2.amazonaws.com/Local/contracts' \
--header 'Content-Type: application/json' \
--data-raw '{
    "address": {
        "country": "USA",
        "city": "Anytown",
        "street": "Main Street",
        "number": 111
    },
    "seller_name": "John Doe",
    "property_id": "usa/anytown/main-street/111"
}'
