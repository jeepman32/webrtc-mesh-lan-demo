import udp from "dgram";

import { serverName } from "./peerManager";
import { ports } from "../constants";

type IPv4Address = `${number}.${number}.${number}.${number}`;
const peerFindingServer = (callback: (name: string) => void) => {
  // A map of peers we've found, by address:port
  const peersFound = new Map<IPv4Address, number>();

  // Create tx/rx sockets
  const transmitter = udp.createSocket("udp4");
  const receiver = udp.createSocket("udp4");

  transmitter.bind(() => {
    transmitter.setBroadcast(true);
    transmitter.setMulticastTTL(128);

    // Create our message before sending so we can measure it's length
    const message = Buffer.from(JSON.stringify({ name: serverName }));

    // Send message to the multicast address of the host, so that our anonymous peers on the LAN can listen
    transmitter.send(
      message,
      0,
      message.length,
      ports.PEER_FINDING_PORT,
      "224.0.0.1"
    );
  });

  // Start listening for all anonymous peers on the LAN
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

  receiver.bind(ports.PEER_FINDING_PORT);

  process.on("beforeExit", () => {
    transmitter.close();
    receiver.close();
  });

  return;
};

export default peerFindingServer;
