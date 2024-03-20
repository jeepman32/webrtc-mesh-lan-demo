/*
MIT License

Copyright (c) 2016 Grall Arnaud

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
'use strict'

const Foglet = require('./src/foglet.js')
const Communication = require('./src/network/communication/communication.js')
const protocol = require('./src/fprotocol/protocol-builder.js')
const Signaling = require('./src/network/signaling/signaling.js')
// networks
const Spray = require('./src/network/rps/sprayAdapter.js')
const Cyclon = require('./src/network/rps/cyclon-adapter')
// abstracts
const AbstractNetwork = require('./src/network/abstract/abstract-network.js')
const AbstractOverlay = require('./src/network/abstract/abstract-overlay.js')
const TManOverlay = require('./src/network/abstract/tman-overlay.js')
// simple-peer moc
const SimplePeerMoc = require('./src/utils/simple-peer-moc')
// Signaling
module.exports = {
  Foglet,
  protocol,
  Signaling,
  /*
   Moc to simulate abstract webrtc connections, to use within a lot of foglets on the same page.
   It uses a centralized manager to manage connection.
   Tried with 200 peers on a NodeJs script.
   */
  SimplePeerMoc,
  /*
   Externalize Communication Class to enable the creation of a specific communication channel
   inside the creation of a new network:
   eg: create your own overlay or rps and use our communication channel for internal communications
   Warning: use a unique protocol
  */
  networks: {
    Spray, Cyclon
  },
  communication: Communication,
  abstract: {
    rps: AbstractNetwork,
    overlay: AbstractOverlay,
    tman: TManOverlay
  }
}
