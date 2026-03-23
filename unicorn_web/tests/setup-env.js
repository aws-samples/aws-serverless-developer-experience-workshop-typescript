process.env.DYNAMODB_TABLE = 'test-table';
process.env.EVENT_BUS = 'test-event-bus';
process.env.LOG_LEVEL = 'SILENT';
process.env.POWERTOOLS_DEV = 'false';

// Suppress Powertools Metrics noise in tests
const metricsNoise = 'No application metrics to publish';

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
process.stdout.write = (chunk, ...args) => {
  const str = typeof chunk === 'string' ? chunk : chunk.toString();
  if (str.includes(metricsNoise) || str.includes('CloudWatchMetrics')) return true;
  return originalStdoutWrite(chunk, ...args);
};

const originalStderrWrite = process.stderr.write.bind(process.stderr);
process.stderr.write = (chunk, ...args) => {
  const str = typeof chunk === 'string' ? chunk : chunk.toString();
  if (str.includes(metricsNoise)) return true;
  return originalStderrWrite(chunk, ...args);
};
