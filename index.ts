import { Worker } from "worker_threads";

// const tsx = new URL(import.meta.resolve("tsx/cli"));
// const WORKERS_COUNT = 4;

// for (let index = 0; index < WORKERS_COUNT; index++) {
//   const PORT = (5001 + index).toString(10);

//   const worker = new Worker(tsx, {
//     env: { PORT },
//     argv: ["./worker.ts"],
//   });

//   worker.on("message", (msg) => console.log(`Worker message received: ${msg}`));
//   worker.on("error", (error) => console.error(error));
//   worker.on("exit", (code) => console.log(`Worker exited with code ${code}.`));

//   // Had some problems where the worker would asynchronously terminate, so manually pass the termination.
//   process.on("SIGTERM", worker.terminate);

//   // Linux really doesn't like it if you try to open all these ports within a few ms of each other, so we pump the brakes here.
//   await new Promise((resolve) => setTimeout(resolve, 100));
// }

import udp from "dgram";

const news = [
  "Borussia Dortmund wins German championship",
  "Tornado warning for the Bay Area",
  "More rain for the weekend",
  "Android tablets take over the world",
  "iPad2 sold out",
  "Nation's rappers down to last two samples",
];

const server = udp.createSocket("udp4");

server.bind(() => {
  server.setBroadcast(true);
  server.setMulticastTTL(128);

  setInterval(() => {
    const message = Buffer.from(
      news[
        Math.floor(Math.random() * news.length) as keyof typeof news
      ] as string
    );
    server.send(message, 0, message.length, 5007, "224.1.1.1");
  }, 3000);
});

server.on("message", (message, remote) => {
  const serverAddress = server.remoteAddress().address;
  if (remote.address !== serverAddress) {
    console.log(
      "SERVER From: " + remote.address + ":" + remote.port + " - " + message
    );
  }
});

const PORT = 5007;
const client = udp.createSocket("udp4");

client.on("listening", function () {
  client.setBroadcast(true);
  client.setMulticastTTL(128);
  client.addMembership("224.1.1.1");
});

client.on("message", (message, remote) => {
  console.log("From: " + remote.address + ":" + remote.port + " - " + message);
});

client.bind(PORT);
