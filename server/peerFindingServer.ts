import udp from "dgram";
import { serverName } from "./peerManager";

type IPv4Address = `${number}.${number}.${number}.${number}`;

const peerFindingServer = (callback: (name: string) => void) => {
  const peersFound = new Map<IPv4Address, number>();

  const RECEIVER_PORT = 5000;

  const transmitter = udp.createSocket("udp4");
  const receiver = udp.createSocket("udp4");

  transmitter.bind(() => {
    transmitter.setBroadcast(true);
    transmitter.setMulticastTTL(128);

    const message = Buffer.from(JSON.stringify({ name: serverName }));

    transmitter.send(message, 0, message.length, RECEIVER_PORT, "224.0.0.1");
  });

  receiver.on("listening", function () {
    receiver.setBroadcast(true);
    receiver.setMulticastTTL(128);
    receiver.addMembership("224.0.0.1");
  });

  receiver.on("message", (message, remote) => {
    // If this is a new peer, then callback
    if (!peersFound.has(remote.address as IPv4Address)) {
      const { name } = JSON.parse(message.toString());

      callback(name);
    }
  });

  receiver.bind(RECEIVER_PORT);

  process.on("beforeExit", () => {
    console.log("killing...");
    transmitter.close();
    receiver.close();
  });

  return;
};

export default peerFindingServer;
