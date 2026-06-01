import 'dotenv/config';
import { spawn } from 'node:child_process';

const port = process.env.PORT || '3000';
const ngrokAuthtoken = process.env.NGROK_AUTHTOKEN?.trim();
const isWindows = process.platform === 'win32';

function start(command, args) {
  return spawn(command, args, {
    env: process.env,
    shell: isWindows,
    stdio: 'inherit',
  });
}

const next = start('pnpm', ['exec', 'next', 'dev', '--port', port]);
const ngrokArgs = ['http', port];

if (ngrokAuthtoken) {
  ngrokArgs.push('--authtoken', ngrokAuthtoken);
}

const ngrok = start('ngrok', ngrokArgs);
let shuttingDown = false;

async function printNgrokUrl() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:4040/api/tunnels');

      if (response.ok) {
        const payload = await response.json();
        const publicUrl = payload.tunnels?.find((tunnel) =>
          tunnel.public_url?.startsWith('https://'),
        )?.public_url;

        if (publicUrl) {
          console.log(`ngrok: ${publicUrl}`);
          console.log(`Lemon Squeezy webhook: ${publicUrl}/api/webhooks/lemonsqueezy`);
          return;
        }
      }
    } catch {
      // ngrok agent API is not ready yet.
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.warn('ngrok started, but its public URL could not be read from http://127.0.0.1:4040.');
}

function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  next.kill();
  ngrok.kill();
  process.exit(exitCode);
}

next.on('exit', (code) => shutdown(code ?? 0));
ngrok.on('exit', (code) => shutdown(code ?? 1));
next.on('error', () => shutdown(1));
ngrok.on('error', () => {
  console.error('Unable to start ngrok. Install ngrok and run `ngrok config add-authtoken ...`.');
  shutdown(1);
});

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());

void printNgrokUrl();
