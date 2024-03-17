import udp from "dgram";

const port = parseInt(process.env.PORT as string, 10);

const socket = udp.createSocket({ type: "udp4" });

socket.bind(port, "0.0.0.0", () => {
  console.log(`Socket bound to port ${port}`);
});

socket.on("listening", () => {
  socket.addMembership("224.0.0.1");
  socket.setBroadcast(true);
  socket.setMulticastTTL(128);

  const message = `Hello from worker:${port}`;

  setInterval(() => {
    console.log("sending my message");
    socket.send(message, 0, message.length, port, "224.0.0.1");
  }, 1000);
});

socket.on("error", console.error);

socket.on("message", (buffer) => {
  console.log(`This is worker:${port} with a message:`, buffer.toString());
});
