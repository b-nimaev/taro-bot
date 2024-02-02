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
exports.my_sentences_handler = void 0;
const ISentence_1 = require("../../../models/ISentence");
const IUser_1 = require("../../../models/IUser");
const greeting_1 = __importDefault(require("./greeting"));
// const timezone = 'Asia/Shanghai'; // ваш часовой пояс
function my_sentences(ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `<b>Статистика</b> \n\n`;
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
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
            // message += `Здесь будет отображаться ваша статисика по работе с предложениями\n\n`
            const user = yield IUser_1.User.findOne({ id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id });
            let props_obj = {
                accepted: [],
                declined: [],
                not_view: []
            };
            if (user) {
                let props = user.proposed_proposals;
                if (props) {
                    for (let i = 0; i < props.length; i++) {
                        const sentence = yield ISentence_1.Sentence.findOne({ _id: props[i].id });
                        if (sentence) {
                            if (sentence.accepted === 'accepted') {
                                props_obj.accepted.push(sentence);
                            }
                            if (sentence.accepted === 'declined') {
                                props_obj.declined.push(sentence);
                            }
                            if (sentence.accepted === 'not view') {
                                props_obj.not_view.push(sentence);
                            }
                        }
                    }
                }
                if (user.proposed_proposals) {
                    if (user.proposed_proposals.length) {
                        message += `🗃 Отправлено предложений: <b>${user.proposed_proposals.length}</b>\n`;
                        if (props_obj.accepted.length) {
                            message += `✅ <b>Принято предложений: ${props_obj.accepted.length}</b> \n`;
                        }
                        if (props_obj.declined.length) {
                            message += `❌ Не принято предложений: <b>${props_obj.declined.length}</b>\n`;
                        }
                        if (props_obj.not_view.length) {
                            message += `🧐 <b>Предложений на рассмотрении: ${props_obj.not_view.length}</b>`;
                        }
                    }
                }
            }
            if (ctx.updateType === 'callback_query') {
                ctx.answerCbQuery();
                yield ctx.editMessageText(message, extra);
            }
            else {
                yield ctx.reply(message, extra);
            }
            ctx.wizard.selectStep(1);
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = my_sentences;
function my_sentences_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                if (ctx.update.callback_query.data) {
                    let data = ctx.update.callback_query.data;
                    if (data === "back") {
                        ctx.wizard.selectStep(0);
                        yield (0, greeting_1.default)(ctx);
                    }
                }
            }
            else {
                yield my_sentences(ctx);
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.my_sentences_handler = my_sentences_handler;
//# sourceMappingURL=mySentences.js.map