#echo '{
#    "address": {
#        "country": "USA",
#        "city": "Anytown",
#        "street": "Main Street",
#        "number": 111
#    },
#    "seller_name": "John Doe",
#    "property_id": "usa/anytown/main-street/'$1'"
#}'
#
#
#curl --location --request POST "https://bxzn3p9db9.execute-api.ap-southeast-2.amazonaws.com/local/contract" \
#    --header 'Content-Type: application/json' \
#    --data-raw '{
#        "address": {
#            "country": "USA",
#            "city": "Anytown",
#            "street": "Main Street",
#            "number": 111
#        },
#        "seller_name": "John Doe",
#        "property_id": "usa/anytown/main-street/'$1'"
#        }'

curl --location --request PUT "https://bxzn3p9db9.execute-api.ap-southeast-2.amazonaws.com/local/contract" \
    --header 'Content-Type: application/json' \
    --data-raw ' { "property_id": "usa/anytown/main-street/123" }'
