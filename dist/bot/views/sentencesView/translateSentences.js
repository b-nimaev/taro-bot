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
exports.translate_sentences_handler = exports.skip_sentence = void 0;
const ISentence_1 = require("../../../models/ISentence");
const greeting_1 = __importDefault(require("./greeting"));
const render_sft_1 = __importDefault(require("./render_sft"));
const IUser_1 = require("../../../models/IUser");
function skip_sentence(ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield IUser_1.User.findOne({ id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id });
            if (!user || !user._id) {
                return false;
            }
            const sentenceId = ctx.scene.session.sentence_id;
            yield ISentence_1.Sentence.findByIdAndUpdate(sentenceId, {
                $push: { skipped_by: user._id },
            });
            yield (0, render_sft_1.default)(ctx);
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.skip_sentence = skip_sentence;
function translate_sentences(ctx) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = '<b>Добавление перевода 🎯</b>\n\n';
            message += 'Я буду давать предложение за предложением для перевода, можно заполнять данные без остановки.\n\n';
            message += `<b>Несколько важных правил:</b>\n\n`;
            message += `— Переводим слово в слово\n`;
            message += `— Используем минимум ород угэнуудые \n`;
            message += `— Всё предложение пишем на кириллице \n`;
            message += `— Не забываем про знаки препинания \n\n`;
            message += `— Буквы отсутствующие в кириллице — <code>һ</code>, <code>ү</code>, <code>өө</code>, копируем из предложенных. \n\n❗️При клике на них, скопируется нужная буква \n\n`;
            message += `<b>И помните, чем качественнее перевод — тем дольше проживет язык</b>`;
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: []
                }
            };
            (_a = extra.reply_markup) === null || _a === void 0 ? void 0 : _a.inline_keyboard.push([{
                    text: 'Начать',
                    callback_data: 'start'
                }]);
            const user = yield IUser_1.User.findOne({ id: (_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id });
            if (!user || !user._id) {
                return false;
            }
            yield ISentence_1.Sentence.find({ skipped_by: { $in: [user._id] } }).then((sentences) => __awaiter(this, void 0, void 0, function* () {
                var _d;
                if (sentences) {
                    if (sentences.length > 0) {
                        (_d = extra.reply_markup) === null || _d === void 0 ? void 0 : _d.inline_keyboard.push([{
                                text: `Сбросить пропущенные предложения (${sentences.length})`,
                                callback_data: 'reset_skipped'
                            }]);
                    }
                }
            }));
            (_c = extra.reply_markup) === null || _c === void 0 ? void 0 : _c.inline_keyboard.push([{
                    text: 'Назад',
                    callback_data: 'back'
                }]);
            if (ctx.updateType === 'callback_query') {
                yield ctx.editMessageText(message, extra);
            }
            else {
                yield ctx.reply(message, extra);
            }
            ctx.wizard.selectStep(3);
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = translate_sentences;
function reset_skipped(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield IUser_1.User.findOne({ id: ctx.from.id });
            yield ISentence_1.Sentence.updateMany({
                skipped_by: { $in: [user._id] }
            }, {
                $pull: {
                    skipped_by: user._id
                }
            }).then(() => __awaiter(this, void 0, void 0, function* () {
                ctx.answerCbQuery('Пропущенные слова сброшены');
            })).catch(() => __awaiter(this, void 0, void 0, function* () {
                ctx.answerCbQuery('Возникла ошибка');
            }));
        }
        catch (err) {
            console.log(err);
        }
    });
}
function translate_sentences_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ctx.from) {
            try {
                if (ctx.updateType === 'callback_query') {
                    if (ctx.update.callback_query.data) {
                        let data = ctx.update.callback_query.data;
                        if (data === 'back') {
                            yield (0, greeting_1.default)(ctx);
                            ctx.wizard.selectStep(0);
                        }
                        if (data === 'skip') {
                            return yield skip_sentence(ctx);
                        }
                        if (data === 'start') {
                            yield (0, render_sft_1.default)(ctx);
                        }
                        if (data === 'reset_skipped') {
                            yield reset_skipped(ctx);
                            yield translate_sentences(ctx);
                        }
                        if (data === 'end') {
                            yield (0, greeting_1.default)(ctx);
                        }
                    }
                }
                else {
                    if (ctx.update.message.text === '/start') {
                        ctx.scene.enter("home");
                    }
                    if (ctx.update.message.text === '/skip') {
                        return yield skip_sentence(ctx);
                    }
                    else {
                        yield translate_sentences(ctx);
                    }
                }
            }
            catch (err) {
                console.log(err);
            }
        }
    });
}
exports.translate_sentences_handler = translate_sentences_handler;
//# sourceMappingURL=translateSentences.js.map