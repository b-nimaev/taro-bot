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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const greeting_1 = __importDefault(require("./sentencesView/greeting"));
const mySentences_1 = __importStar(require("./sentencesView/mySentences"));
const translateSentences_1 = __importStar(require("./sentencesView/translateSentences"));
const render_sft_1 = require("./sentencesView/render_sft");
const addSentences_1 = __importStar(require("./sentencesView/addSentences"));
const handler = new telegraf_1.Composer();
const sentences = new telegraf_1.Scenes.WizardScene("sentences", handler, (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, mySentences_1.my_sentences_handler)(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, addSentences_1.add_sentences_handler)(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, translateSentences_1.translate_sentences_handler)(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, render_sft_1.add_translate_to_sentences_hander)(ctx); }));
sentences.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, greeting_1.default)(ctx); }));
sentences.action('my_sentences', (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, mySentences_1.default)(ctx); }));
sentences.command("add_sentence", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, addSentences_1.default)(ctx); }));
sentences.action("translate_sentences", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, translateSentences_1.default)(ctx); }));
sentences.action("home", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.answerCbQuery();
    ctx.scene.enter('home');
}));
// обработка входящих на сцене
handler.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, greeting_1.default)(ctx); }));
exports.default = sentences;
//# sourceMappingURL=sentences.scene.js.map