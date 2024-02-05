const openApiAsset = new Asset(this, 'openApiAsset', {
    path: (path.join(__dirname, '../../api.yaml')),
  })
  const transformedApiSpec = Fn.transform("AWS::Include",
    { 'Location': openApiAsset.s3ObjectUrl });

  const api = new apigateway.SpecRestApi(this, "UnicornContractsApi", {
    apiDefinition: apigateway.ApiDefinition.fromInline(transformedApiSpec),
    cloudWatchRole: true,
    deployOptions: {
      stageName: props.stage,
      dataTraceEnabled: true,
      tracingEnabled: true,
      metricsEnabled: true,
      accessLogDestination: new apigateway.LogGroupLogDestination(apiLogs),
      accessLogFormat: apigateway.AccessLogFormat.custom(JSON.stringify({
        "requestId": "$context.requestId",
        "integration-error": "$context.integration.error",
        "integration-status": "$context.integration.status",
        "integration-latency": "$context.integration.latency",
        "integration-requestId": "$context.integration.requestId",
        "integration-integrationStatus": "$context.integration.integrationStatus",
        "response-latency": "$context.responseLatency",
        "status": "$context.status",
      })),
      methodOptions: {
        '/*/*': {
          loggingLevel: isProd(props.stage) ? apigateway.MethodLoggingLevel.ERROR : apigateway.MethodLoggingLevel.INFO,
          throttlingBurstLimit: 10,
          throttlingRateLimit: 100
        }

      }
    },
    endpointTypes: [EndpointType.REGIONAL],
  })