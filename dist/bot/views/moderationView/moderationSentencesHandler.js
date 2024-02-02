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
exports.updateSentence = exports.moderation_sentences_handler = void 0;
const ISentence_1 = require("../../../models/ISentence");
const greeting_1 = __importDefault(require("./greeting"));
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
                    yield updateSentence(ctx, 'accepted');
                }
                if (data === 'bad') {
                    yield updateSentence(ctx, 'declined');
                }
                ctx.answerCbQuery();
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.moderation_sentences_handler = moderation_sentences_handler;
function updateSentence(ctx, value) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ISentence_1.Sentence.findByIdAndUpdate(ctx.session.__scenes.moderation_sentence, { $set: { 'accepted': value } })
            .then((sentence) => __awaiter(this, void 0, void 0, function* () {
            if (sentence) {
                if (sentence.accepted === 'accepted') {
                    return ctx.answerCbQuery('Предложение принято ✅');
                }
                if (sentence.accepted === 'declined') {
                    return ctx.answerCbQuery('Предложение отправлено на рассмотрение');
                }
            }
        })).catch((error) => __awaiter(this, void 0, void 0, function* () { console.error(error); yield (0, greeting_1.default)(ctx); }));
        yield (0, sentencesRender_1.default)(ctx);
    });
}
exports.updateSentence = updateSentence;
//# sourceMappingURL=moderationSentencesHandler.js.map