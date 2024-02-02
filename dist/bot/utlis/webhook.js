"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.set_webhook = void 0;
const index_js_1 = require("../../index.js");
const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
    const { default: fetch } = yield Promise.resolve().then(() => __importStar(require('node-fetch')));
    const res = yield fetch('http://localhost:4040/api/tunnels');
    const json = yield res.json();
    //@ts-ignore
    const secureTunnel = json.tunnels.find((tunnel) => tunnel.proto === 'https');
    yield index_js_1.bot.telegram.setWebhook(`${secureTunnel.public_url}/bot`);
    console.log(`webhook set: ${status}`);
});
function set_webhook() {
    return __awaiter(this, void 0, void 0, function* () {
        if (process.env.MODE === 'production') {
            index_js_1.bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}/bot${process.env.secret_path}`).then(() => {
                console.log('webhook setted');
            });
        }
        else {
            yield fetchData().catch((error) => {
                console.error('Error setting webhook:', error);
            });
        }
    });
}
exports.set_webhook = set_webhook;
module.exports = set_webhook;
//# sourceMappingURL=webhook.js.map