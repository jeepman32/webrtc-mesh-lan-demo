// Start the peerServer to find our peers (friends)

import peerFindingServer from "server/peerFindingServer";
import peerManager from "server/peerManager";

// It calls back when it's found a new friend
peerFindingServer(peerManager);
