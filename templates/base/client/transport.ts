import { Reader, Writer } from "bin-serde";
import { Socket } from "net";
import { COORDINATOR_HOST } from "../../api/base";
import { decodeStateSnapshot, PlayerState } from "../../api/types";
import { StateId } from "./client";
import WebSocket from "isomorphic-ws";

export enum TransportType {
  WebSocket,
  TCP,
  UDP,
}

export interface HathoraTransport {
  connect(
    stateId: StateId,
    token: string,
    onData: (data: Buffer) => void,
    onClose: (e: { code: number; reason: string }) => void
  ): Promise<PlayerState>;
  disconnect(code?: number): void;
  isReady(): boolean;
  write(data: Uint8Array): void;
}

export class WebSocketHathoraTransport implements HathoraTransport {
  private socket: WebSocket;
  constructor(private appId: string) {
    this.socket = new WebSocket(`wss://${COORDINATOR_HOST}/${appId}`);
  }
  connect(
    stateId: string,
    token: string,
    onData: (data: Buffer) => void,
    onClose: (e: { code: number; reason: string }) => void
  ): Promise<PlayerState> {
    return new Promise((resolve, reject) => {
      this.socket.binaryType = "arraybuffer";
      this.socket.onclose = onClose;
      this.socket.onopen = () =>
        this.socket.send(
          new Writer()
            .writeUInt8(0)
            .writeString(token)
            .writeUInt64([...stateId].reduce((r, v) => r * 36n + BigInt(parseInt(v, 36)), 0n))
            .toBuffer()
        );
      this.socket.onmessage = ({ data }) => {
        const reader = new Reader(new Uint8Array(data as ArrayBuffer));
        const type = reader.readUInt8();
        if (type === 0) {
          this.socket.onmessage = ({ data }) => onData(data as Buffer);
          this.socket.onclose = onClose;
          resolve(decodeStateSnapshot(reader));
        } else {
          reject("Unexpected message type: " + type);
        }
      };
    });
  }
  disconnect(code?: number | undefined): void {
    if (code === undefined) {
      this.socket.onclose = () => {};
    }
    this.socket.close(code);
  }
  isReady(): boolean {
    return this.socket.readyState === this.socket.OPEN;
  }
  write(data: Uint8Array): void {
    this.socket.send(data);
  }
}

export class TCPHathoraTransport implements HathoraTransport {
  private socket: Socket;
  constructor(private appId: string) {
    this.socket = new Socket();
  }

  public async connect(
    stateId: StateId,
    token: string,
    onData: (data: Buffer) => void,
    onClose: (e: { code: number; reason: string }) => void
  ): Promise<PlayerState> {
    return new Promise((resolve, reject) => {
      this.socket.connect(7148, COORDINATOR_HOST);
      this.socket.on("connect", () =>
        this.socket.write(
          new Writer()
            .writeString(token)
            .writeString(this.appId)
            .writeUInt64([...stateId].reduce((r, v) => r * 36n + BigInt(parseInt(v, 36)), 0n))
            .toBuffer()
        )
      );
      this.socket.once("data", (data: Buffer) => {
        const reader = new Reader(new Uint8Array(data as ArrayBuffer));
        const type = reader.readUInt8();
        if (type === 0) {
          this.readTCPData(onData);
          this.socket.on("close", onClose);
          resolve(decodeStateSnapshot(reader));
        } else {
          reject("Unknown message type: " + type);
        }
      });
    });
  }

  public write(data: Uint8Array) {
    this.socket.write(new Writer().writeUInt32(data.length).writeBuffer(data).toBuffer());
  }

  public disconnect(code?: number | undefined): void {
    this.socket.destroy();
  }

  public isReady(): boolean {
    return this.socket.readyState === "open";
  }

  private readTCPData(onData: (data: Buffer) => void) {
    let buf = Buffer.alloc(0);
    this.socket.on("data", (data) => {
      buf = Buffer.concat([buf, data]);
      while (buf.length >= 4) {
        const bufLen = buf.readUInt32BE();
        if (buf.length < 4 + bufLen) {
          return;
        }
        onData(buf.slice(4, 4 + bufLen));
        buf = buf.slice(4 + bufLen);
      }
    });
  }
}
