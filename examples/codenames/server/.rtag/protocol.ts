import net from "net";
import retry from "retry";
import { SmartBuffer } from "smart-buffer";

type StateId = bigint;
type UserId = string;

const NEW_STATE = 0;
const SUBSCRIBE_USER = 1;
const UNSUBSCRIBE_USER = 2;
const HANDLE_UPDATE = 3;

function readData(socket: net.Socket, onData: (data: Buffer) => void) {
  let buf = Buffer.alloc(0);
  socket.on("data", (data) => {
    buf = Buffer.concat([buf, data]);
    while (buf.length >= 4) {
      const bufLen = buf.readUInt32LE();
      if (buf.length < 4 + bufLen) {
        return;
      }
      onData(buf.slice(4, 4 + bufLen));
      buf = buf.slice(4 + bufLen);
    }
  });
}

export function register(store: Store): Promise<CoordinatorClient> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    const operation = retry.operation();
    operation.attempt(() => {
      socket.connect(7147, "rtag.dev", () => {
        socket.setKeepAlive(true, 30000);
        socket.write(
          JSON.stringify({
            appSecret: process.env.APP_SECRET!,
            authInfo: {
              anonymous: { separator: "-" },
              google: { clientId: "848412826788-m4msrb6q44dm2ue3kgvui0fq7kda55ls.apps.googleusercontent.com" },
            },
          })
        );
        console.log("Connected to coordinator");
        resolve(new CoordinatorClient(socket));
      });
    });
    socket.on("error", (err) => {
      if (!operation.retry(err)) {
        reject(operation.mainError);
      }
    });
    readData(socket, (data) => {
      const reader = SmartBuffer.fromBuffer(data);
      while (reader.remaining() > 0) {
        const type = reader.readInt8();
        if (type === NEW_STATE) {
          store.newState(
            reader.readBigUInt64LE(),
            reader.readString(reader.readUInt32LE()),
            reader.readBuffer(reader.readUInt32LE())
          );
        } else if (type === SUBSCRIBE_USER) {
          store.subscribeUser(reader.readBigUInt64LE(), reader.readString(reader.readUInt32LE()));
        } else if (type === UNSUBSCRIBE_USER) {
          store.unsubscribeUser(reader.readBigUInt64LE(), reader.readString(reader.readUInt32LE()));
        } else if (type === HANDLE_UPDATE) {
          store.handleUpdate(
            reader.readBigUInt64LE(),
            reader.readString(reader.readUInt32LE()),
            reader.readBuffer(reader.readUInt32LE())
          );
        }
      }
    });
  });
}

interface Store {
  newState(stateId: StateId, userId: UserId, argsBuffer: Buffer): void;
  subscribeUser(stateId: StateId, userId: UserId): void;
  unsubscribeUser(stateId: StateId, userId: UserId): void;
  handleUpdate(stateId: StateId, userId: UserId, data: Buffer): void;
}

class CoordinatorClient {
  constructor(private socket: net.Socket) {}

  public onStateUpdate(stateId: StateId, userId: UserId, data: Buffer) {
    const buf = new SmartBuffer()
      .writeBigUInt64LE(stateId)
      .writeUInt32LE(userId.length)
      .writeString(userId)
      .writeBuffer(data);
    this.socket.write(buf.insertUInt32LE(buf.length, 0).toBuffer());
  }
}
