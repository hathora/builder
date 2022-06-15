"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.TCPHathoraTransport = exports.WebSocketHathoraTransport = exports.TransportType = void 0;
var bin_serde_1 = require("bin-serde");
var net_1 = require("net");
var base_1 = require("../../api/base");
var types_1 = require("../../api/types");
var isomorphic_ws_1 = require("isomorphic-ws");
var TransportType;
(function (TransportType) {
    TransportType[TransportType["WebSocket"] = 0] = "WebSocket";
    TransportType[TransportType["TCP"] = 1] = "TCP";
    TransportType[TransportType["UDP"] = 2] = "UDP";
})(TransportType = exports.TransportType || (exports.TransportType = {}));
var WebSocketHathoraTransport = /** @class */ (function () {
    function WebSocketHathoraTransport(appId) {
        this.appId = appId;
        this.socket = new isomorphic_ws_1["default"]("wss://" + base_1.COORDINATOR_HOST + "/" + appId);
    }
    WebSocketHathoraTransport.prototype.connect = function (stateId, token, onData, onClose) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.socket.binaryType = "arraybuffer";
            _this.socket.onclose = onClose;
            _this.socket.onopen = function () {
                return _this.socket.send(new bin_serde_1.Writer()
                    .writeUInt8(0)
                    .writeString(token)
                    .writeUInt64(__spreadArrays(stateId).reduce(function (r, v) { return r * 36n + BigInt(parseInt(v, 36)); }, 0n))
                    .toBuffer());
            };
            _this.socket.onmessage = function (_a) {
                var data = _a.data;
                var reader = new bin_serde_1.Reader(new Uint8Array(data));
                var type = reader.readUInt8();
                if (type === 0) {
                    _this.socket.onmessage = function (_a) {
                        var data = _a.data;
                        return onData(data);
                    };
                    _this.socket.onclose = onClose;
                    resolve(types_1.decodeStateSnapshot(reader));
                }
                else {
                    reject("Unexpected message type: " + type);
                }
            };
        });
    };
    WebSocketHathoraTransport.prototype.disconnect = function (code) {
        if (code === undefined) {
            this.socket.onclose = function () { };
        }
        this.socket.close(code);
    };
    WebSocketHathoraTransport.prototype.isReady = function () {
        return this.socket.readyState === this.socket.OPEN;
    };
    WebSocketHathoraTransport.prototype.write = function (data) {
        this.socket.send(data);
    };
    return WebSocketHathoraTransport;
}());
exports.WebSocketHathoraTransport = WebSocketHathoraTransport;
var TCPHathoraTransport = /** @class */ (function () {
    function TCPHathoraTransport(appId) {
        this.appId = appId;
        this.socket = new net_1.Socket();
    }
    TCPHathoraTransport.prototype.connect = function (stateId, token, onData, onClose) {
        return __awaiter(this, void 0, Promise, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.socket.connect(7148, base_1.COORDINATOR_HOST);
                        _this.socket.on("connect", function () {
                            return _this.socket.write(new bin_serde_1.Writer()
                                .writeString(token)
                                .writeString(_this.appId)
                                .writeUInt64(__spreadArrays(stateId).reduce(function (r, v) { return r * 36n + BigInt(parseInt(v, 36)); }, 0n))
                                .toBuffer());
                        });
                        _this.socket.once("data", function (data) {
                            var reader = new bin_serde_1.Reader(new Uint8Array(data));
                            var type = reader.readUInt8();
                            if (type === 0) {
                                _this.readTCPData(onData);
                                _this.socket.on("close", onClose);
                                resolve(types_1.decodeStateSnapshot(reader));
                            }
                            else {
                                reject("Unknown message type: " + type);
                            }
                        });
                    })];
            });
        });
    };
    TCPHathoraTransport.prototype.write = function (data) {
        this.socket.write(new bin_serde_1.Writer().writeUInt32(data.length).writeBuffer(data).toBuffer());
    };
    TCPHathoraTransport.prototype.disconnect = function (code) {
        this.socket.destroy();
    };
    TCPHathoraTransport.prototype.isReady = function () {
        return this.socket.readyState === "open";
    };
    TCPHathoraTransport.prototype.readTCPData = function (onData) {
        var buf = Buffer.alloc(0);
        this.socket.on("data", function (data) {
            buf = Buffer.concat([buf, data]);
            while (buf.length >= 4) {
                var bufLen = buf.readUInt32BE();
                if (buf.length < 4 + bufLen) {
                    return;
                }
                onData(buf.slice(4, 4 + bufLen));
                buf = buf.slice(4 + bufLen);
            }
        });
    };
    return TCPHathoraTransport;
}());
exports.TCPHathoraTransport = TCPHathoraTransport;
