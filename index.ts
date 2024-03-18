// @ts-expect-error
import wrtc from "wrtc";
import udp from "dgram";
import SimplePeer from "simple-peer";
import { createNameId } from "mnemonic-id";

import peerFindingServer from "server/peerFindingServer";

export const serverName = createNameId();

interface Message {
  from: string;
  to: string;
  data: any;
}

const RECEIVER_PORT = 5001;

const peerConnections = new Map<string, SimplePeer.Instance>();

const receiver = udp.createSocket("udp4");
const transmitter = udp.createSocket("udp4");

receiver.on("listening", function () {
  receiver.setBroadcast(true);
  receiver.setMulticastTTL(128);
  receiver.addMembership("224.0.0.1");
});

receiver.bind(RECEIVER_PORT);

receiver.on("message", (rawMessage, _remote) => {
  const {
    from,
    to,
    data: message,
  } = JSON.parse(rawMessage.toString()) as Message;

  if (to !== serverName) {
    return;
  }

  if (message.type === "answer") {
    const initiatingPeer = peerConnections.get(from);

    if (initiatingPeer) {
      initiatingPeer.signal(message);
    }
  }

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

    peer.on("signal", (data) => {
      const message = JSON.stringify({
        from: serverName,
        to: from,
        data,
      } satisfies Message);

      transmitter.send(message, 0, message.length, RECEIVER_PORT, "224.0.0.1");
    });

    peer.on("connect", () => console.log(serverName, "connected to", from));
    peer.on("error", () => console.error);
  }
});

const foundPeerCallback: Parameters<typeof peerFindingServer>[0] = (
  peerName
) => {
  // Don't speak with yourself, it's weird.
  if (peerName === serverName) {
    return;
  }

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

    transmitter.send(message, 0, message.length, RECEIVER_PORT, "224.0.0.1");
  });

  initiatingPeer.on("connect", () =>
    console.log(serverName, "initiator connected to", peerName)
  );

  initiatingPeer.on("stream", () => console.log("stream", serverName));
  initiatingPeer.on("error", () => console.error);
};

// Start the peerServer to find our peers (friends)
// It calls back when it's found a new friend
peerFindingServer(foundPeerCallback);
