import express, { Application } from "express";
import { createServer, Server as HTTPServer } from "http";

export class Server {
  private httpServer: HTTPServer;
  private app: Application;
  private port: number;

  constructor(port: number) {
    this.initialize();
    this.handleRoutes();
    this.port = port;
  }

  private initialize(): void {
    this.app = express();
    this.httpServer = createServer(this.app);
  }

  private handleRoutes(): void {
    this.app.get("/", (_req, res) => {
      res.send(`<h1>Hello World</h1>`);
    });
  }

  public listen(callback: (port: number) => void): void {
    this.httpServer.listen(this.port, () => callback(this.port));
  }
}
