#!/usr/bin/env bash
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
STACK_NAME="uni-prop-local-web"

JSON_FILE="$(cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )/property_data.json"
echo "JSON_FILE: '${JSON_FILE}'"

DDB_TBL_NAME="$(aws cloudformation describe-stacks --stack-name ${STACK_NAME} --query 'Stacks[0].Outputs[?ends_with(OutputKey, `WebTableName`)].OutputValue' --output text)"
echo "DDB_TABLE_NAME: '${DDB_TBL_NAME}'"

echo "LOADING ITEMS TO DYNAMODB:"
aws ddb put ${DDB_TBL_NAME} file://${JSON_FILE}
echo "DONE!"
