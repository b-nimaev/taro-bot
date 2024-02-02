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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moderationSentencesHandler_1 = require("./moderationSentencesHandler");
const sentencesRender_1 = __importDefault(require("./sentencesRender"));
function moderation_sentences_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let update = ctx.updateType;
            if (update === 'callback_query') {
                let data = ctx.update.callback_query.data;
                if (data === 'back') {
                    ctx.scene.enter('moderation');
                }
                if (data === 'good') {
                    yield (0, moderationSentencesHandler_1.updateSentence)(ctx, 'accepted');
                }
                if (data === 'bad') {
                    yield (0, moderationSentencesHandler_1.updateSentence)(ctx, 'declined');
                }
                ctx.answerCbQuery();
            }
            else {
                yield (0, sentencesRender_1.default)(ctx);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = moderation_sentences_handler;
//# sourceMappingURL=sentencesHandler.js.map