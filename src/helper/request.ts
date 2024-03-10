import { OutgoingHttpHeaders } from 'http2';
import https from 'https';

export function post(
  url: string,
  options: {
    json: Record<string, any>;
    headers?: OutgoingHttpHeaders;
  }
): any {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(options.json);
    const req = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
          ...options.headers
        }
      },
      (res) => {
        const chunks = [];

        res.on('data', (data) => chunks.push(data));
        res.on('end', () => {
          const payload = Buffer.concat(chunks);
          resolve(
            /application\/json/.test(res.headers['content-type'])
              ? JSON.parse(payload.toString())
              : payload
          );
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
