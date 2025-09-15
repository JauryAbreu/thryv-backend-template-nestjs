import tracer from 'dd-trace';

export function initializeTracing() {
  // Only initialize if Datadog is enabled
  if (process.env.DD_TRACE_ENABLED === 'true' && process.env.DD_API_KEY) {
    tracer.init({
      env: process.env.DD_ENV || 'development',
      service: process.env.DD_SERVICE || 'thryv-backend',
      version: process.env.DD_VERSION || '1.0.0',
      logInjection: true,
      runtimeMetrics: true,
    });

    console.log('Datadog tracing initialized');
  } else {
    console.log('Datadog tracing disabled (DD_TRACE_ENABLED=false or DD_API_KEY not set)');
  }
}

export { tracer };
