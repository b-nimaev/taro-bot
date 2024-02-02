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
exports.add_sentences_handler = void 0;
const ISentence_1 = require("../../../models/ISentence");
const IUser_1 = require("../../../models/IUser");
const greeting_1 = __importDefault(require("./greeting"));
function add_sentences(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `<b>Добавление перевода — Предложения</b>\n\n`;
            message += `Отправьте предложение на русском языке, которое <b>мы все вместе</b> переведем \n\n`;
            message += `<code>Можно загружать сразу несколько предложений, с разделением %%</code> \n\n`;
            message += `например \n`;
            message += `<code>Предложение 1 %% Предложение 2 %% Предложение 3 ...</code>`;
            const extra = {
                parse_mode: 'HTML', reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Назад',
                                callback_data: 'back'
                            }
                        ]
                    ]
                }
            };
            if (ctx.updateType === 'callback_query') {
                ctx.answerCbQuery();
                yield ctx.editMessageText(message, extra);
                ctx.wizard.selectStep(2);
            }
            else {
                yield ctx.reply(message, extra);
                ctx.wizard.selectStep(2);
            }
        }
        catch (error) {
            console.error(error);
            return yield (0, greeting_1.default)(ctx);
        }
    });
}
exports.default = add_sentences;
function add_sentences_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ctx.from) {
            try {
                if (ctx.updateType === 'callback_query') {
                    if (ctx.updateType === 'callback_query') {
                        if (ctx.update.callback_query.data) {
                            let data = ctx.update.callback_query.data;
                            // сохранение предложенных предложений
                            if (data === 'send_sentences') {
                                for (let i = 0; i < ctx.session.sentences.length; i++) {
                                    const user = yield IUser_1.User.findOne({ id: ctx.from.id });
                                    if (!user || !user._id) {
                                        ctx.wizard.selectStep(0);
                                        yield (0, greeting_1.default)(ctx);
                                        return false;
                                    }
                                    const sentence = {
                                        text: ctx.session.sentences[i],
                                        author: user._id
                                    };
                                    new ISentence_1.Sentence(sentence).save().then((createdSentence) => __awaiter(this, void 0, void 0, function* () {
                                        const objectID = createdSentence._id;
                                        new IUser_1.ProposedProposalModel({ id: objectID }).save();
                                        yield IUser_1.User.findByIdAndUpdate(user._id, {
                                            $push: {
                                                proposed_proposals: {
                                                    id: objectID,
                                                }
                                            }
                                        });
                                    }));
                                }
                                yield ctx.answerCbQuery(`${ctx.session.sentences} отправлены на проверку, спасибо!`);
                                ctx.wizard.selectStep(0);
                                yield (0, greeting_1.default)(ctx);
                            }
                            if (data === 'back') {
                                ctx.wizard.selectStep(0);
                                yield ctx.answerCbQuery();
                                return (0, greeting_1.default)(ctx);
                            }
                        }
                    }
                }
                else if (ctx.updateType === 'message') {
                    if (ctx.update.message.text) {
                        const text = ctx.update.message.text;
                        const user = yield IUser_1.User.findOne({ id: ctx.from.id });
                        if (!user || !user._id) {
                            return false;
                        }
                        // const sentence: ISentence = {
                        // text: text.toLocaleLowerCase(),
                        // author: user._id,
                        // }
                        let message = ``;
                        if (text.indexOf('%%') !== -1) {
                            // если массив предложений, делим их
                            let splitted = text.split('%%');
                            let arr = [];
                            for (let i = 0; i < splitted.length; i++) {
                                arr.push(splitted[i].trimEnd().trimStart());
                            }
                            ctx.session.sentences = arr;
                            console.log(ctx.session.sentences);
                            for (let i = 0; i < splitted.length; i++) {
                                message += `${i + 1}) ${splitted[i].trimStart().trimEnd()}\n`;
                            }
                        }
                        else {
                            ctx.session.sentences = [text];
                            message += text;
                        }
                        yield ctx.reply(message, {
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [
                                    [
                                        {
                                            text: 'Сохранить',
                                            callback_data: 'send_sentences'
                                        }
                                    ],
                                    [
                                        {
                                            text: 'Отмена',
                                            callback_data: 'back'
                                        }
                                    ]
                                ]
                            }
                        });
                    }
                    else {
                        yield ctx.reply("Нужно отправить в текстовом виде");
                    }
                }
            }
            catch (err) {
                ctx.wizard.selectStep(0);
                yield (0, greeting_1.default)(ctx);
            }
        }
    });
}
exports.add_sentences_handler = add_sentences_handler;
//# sourceMappingURL=addSentences.js.map