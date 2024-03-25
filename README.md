# Readme/Notes

A simple program to test the concept of an anonymous peer (us) finding other anonymous peers (them) on a LAN, using UDP broadcasts.

The program will broadcast a signal message, and receive signal messages, that contain information about it's peers. It's not particularly intelligent, and relies on all clients being alive at the same time. It also doesn't handle any fault tolerance, which could be rectified with some sort of heartbeat.

## Prerequisites

- Ensure Node is installed at LTS version
- Install `pnpm` locally or globally using `npm i -g pnpm`
- Run `pnpm i`
- Start the madness with `docker compose up`
- Benchmark your rig by increasing the `replicas` in `docker-compose.yml`
