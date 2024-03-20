// @ts-expect-error
import wrtc from "wrtc";
import udp from "dgram";
import SimplePeer from "simple-peer";
import { createNameId } from "mnemonic-id";

import { ports } from "../constants";
import peerFindingServer from "./peerFindingServer";

export const serverName = createNameId();

interface Message {
  from: string;
  to: string;
  data: any;
}

// Map of simple-peer connections by {[name: string]: Instance}
const peerConnections = new Map<string, SimplePeer.Instance>();

// TX/RX ports for two way comms with our anonymous peers on LAN
const receiver = udp.createSocket("udp4");
const transmitter = udp.createSocket("udp4");

// Listen for peers reaching for connections
receiver.on("listening", () => {
  receiver.setBroadcast(true);
  receiver.setMulticastTTL(128);
  receiver.addMembership("224.0.0.1");
});

receiver.bind(ports.PEER_MANAGER_PORT);
receiver.on("message", (rawMessage) => {
  // Describe the message, its sender and its receiver
  const {
    from,
    to,
    data: message,
  } = JSON.parse(rawMessage.toString()) as Message;

  // Ignore requests received from ourselves
  if (to !== serverName) {
    return;
  }

  // If we get a WebRTC answer, and we have an simple-peer that applies, pass it in
  if (message.type === "answer") {
    const initiatingPeer = peerConnections.get(from);

    if (initiatingPeer) {
      initiatingPeer.signal(message);
    }
  }

  // Otherwise we've received an offer, and we spin up a slave simple-peer instance to receive on
  if (message.type === "offer") {
    const peer = new SimplePeer({
      initiator: false,
      wrtc,
      trickle: false,
      allowHalfTrickle: false,
      config: {
        iceServers: [],
      },
      objectMode: false,
    });

    peer.signal(message);

    // If we get a signal request from simple-peer, package and send it, ensuring it meets our Message type
    peer.on("signal", (data) => {
      const message = JSON.stringify({
        from: serverName,
        to: from,
        data,
      } satisfies Message);

      transmitter.send(
        message,
        0,
        message.length,
        ports.PEER_MANAGER_PORT,
        "224.0.0.1"
      );
    });

    // And some tasty logging
    peer.on("connect", () => console.log(serverName, "connected to", from));
    peer.on("error", () => console.error);
  }
});

// Respond to peers found on the network from peerFindingServer()
const peerManager: Parameters<typeof peerFindingServer>[0] = (peerName) => {
  // Don't speak with yourself, it's weird.
  if (peerName === serverName) {
    return;
  }

  // Create an initiating instance to send a request to our peer
  const initiatingPeer = new SimplePeer({
    initiator: true,
    wrtc,
    trickle: false,
    allowHalfTrickle: false,
    config: {
      iceServers: [],
    },
    objectMode: false,
  });

  peerConnections.set(peerName, initiatingPeer);

  // When SimplePeers wants to connect to a peer, this is where we need to talk to the new peer.
  initiatingPeer.on("signal", (data) => {
    const message = JSON.stringify({
      from: serverName,
      to: peerName,
      data,
    } satisfies Message);

    transmitter.send(
      message,
      0,
      message.length,
      ports.PEER_MANAGER_PORT,
      "224.0.0.1"
    );
  });

  // More tasty logging
  initiatingPeer.on("connect", () =>
    console.log(serverName, "initiator connected to", peerName)
  );

  initiatingPeer.on("stream", () => console.log("stream", serverName));
  initiatingPeer.on("error", () => console.error);
};

export default peerManager;
