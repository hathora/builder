import fs from "fs";
import path from "path";

export default class LogStore {
  private storageDir: string;
  private partitionFiles: Map<bigint, number>;

  public constructor(storageDir: string) {
    this.storageDir = storageDir;
    this.partitionFiles = new Map();
  }

  public append(partitionId: bigint, time: number, record: Uint8Array) {
    if (!this.partitionFiles.has(partitionId)) {
      this.partitionFiles.set(partitionId, fs.openSync(this.getPath(partitionId), "a"));
    }
    const fd = this.partitionFiles.get(partitionId)!;

    const header = Buffer.alloc(12);
    header.writeBigUInt64LE(BigInt(time));
    header.writeUInt16LE(record.byteLength, 8);
    fs.appendFileSync(fd, Buffer.concat([header, record]));
  }

  public load(partitionId: bigint) {
    const fd = fs.openSync(this.getPath(partitionId), "r");
    const metadataBuf = Buffer.alloc(12);

    const rows: { time: number; record: Buffer }[] = [];
    while (fs.readSync(fd, metadataBuf, 0, metadataBuf.length, null) > 0) {
      const time = metadataBuf.readBigUInt64LE();
      const len = metadataBuf.readUInt16LE(8);
      const recordBuf = Buffer.alloc(len);
      fs.readSync(fd, recordBuf, 0, recordBuf.length, null);
      rows.push({ time: Number(time), record: recordBuf });
    }

    fs.closeSync(fd);
    return rows;
  }

  public unload(partitionId: bigint) {
    const fd = this.partitionFiles.get(partitionId);
    if (fd !== undefined) {
      this.partitionFiles.delete(partitionId);
      fs.closeSync(fd);
    }
  }

  private getPath(partitionId: bigint) {
    return path.join(this.storageDir, partitionId.toString(36));
  }
}
