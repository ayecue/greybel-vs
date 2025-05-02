import * as Net from 'net';

import { GreybelDebugSession } from './local/session';
import { AgentDebugSession } from './agent/session';

// first parse command line arguments to see whether the debug adapter should run as a server
let port = 0;
const args = process.argv.slice(2);
args.forEach(function (val, _index, _array) {
  const portMatch = /^--server=(\d{4,5})$/.exec(val);
  if (portMatch) {
    port = parseInt(portMatch[1], 10);
  }
});

if (port > 0) {
  // start a server that creates a new session for every connection request
  console.error(`waiting for debug protocol on port ${port}`);
  Net.createServer((socket) => {
    console.error('>> accepted connection from client');
    socket.on('end', () => {
      console.error('>> client connection closed\n');
    });
    const session = new AgentDebugSession();
    session.setRunAsServer(true);
    session.start(socket, socket);
  }).listen(port);
} else {
  // start a single session that communicates via stdin/stdout
  const session = new AgentDebugSession();
  process.on('SIGTERM', () => {
    session.shutdown();
  });
  session.start(process.stdin, process.stdout);
}
