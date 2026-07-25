import app from '../src/app';
import http from 'http';

const PORT = 10099;
const CONCURRENCY = 10;
const TOTAL_REQUESTS = 200;

async function request(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    http.get(url, (res) => {
      res.resume(); // consume response
      if (res.statusCode === 200) {
        resolve(Date.now() - start);
      } else {
        reject(new Error(`Status: ${res.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function runBenchmark() {
  console.log('--------------------------------------------------');
  console.log('🚀 Starting API Performance Benchmark...');
  console.log(`Target: http://localhost:${PORT}/api/health`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Total Requests: ${TOTAL_REQUESTS}`);
  console.log('--------------------------------------------------');

  // Start the server on the benchmark port
  const server = app.listen(PORT);

  // Wait 1s for server boot
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const latencies: number[] = [];
  let successful = 0;
  let failed = 0;

  const url = `http://localhost:${PORT}/api/health`;
  const startTime = Date.now();

  // Function to run a queue of requests
  const queue = Array.from({ length: TOTAL_REQUESTS });
  let activeIndex = 0;

  async function worker() {
    while (activeIndex < queue.length) {
      const idx = activeIndex++;
      if (idx >= queue.length) break;
      try {
        const duration = await request(url);
        latencies.push(duration);
        successful++;
      } catch (err) {
        failed++;
      }
    }
  }

  // Run concurrency workers
  const workers = Array.from({ length: CONCURRENCY }).map(() => worker());
  await Promise.all(workers);

  const totalTime = (Date.now() - startTime) / 1000; // in seconds
  server.close();

  // Calculate stats
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / (latencies.length || 1);
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);
  const throughput = successful / totalTime;

  console.log('\n📊 Benchmark Results:');
  console.table({
    'Total Duration (s)': { value: Number(totalTime.toFixed(3)) },
    'Total Requests': { value: TOTAL_REQUESTS },
    'Successful Requests': { value: successful },
    'Failed Requests': { value: failed },
    'Success Rate (%)': { value: Number(((successful / TOTAL_REQUESTS) * 100).toFixed(1)) },
    'Avg Latency (ms)': { value: Number(avgLatency.toFixed(2)) },
    'Min Latency (ms)': { value: minLatency },
    'Max Latency (ms)': { value: maxLatency },
    'Throughput (req/sec)': { value: Number(throughput.toFixed(2)) },
  });
  console.log('--------------------------------------------------');
}

runBenchmark().catch(console.error);
