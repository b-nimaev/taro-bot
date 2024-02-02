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
const ISentence_1 = require("../../../models/ISentence");
const greeting_1 = __importDefault(require("./greeting"));
function moderation_sentences_render(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield ISentence_1.Sentence.findOne({ accepted: "not view" }).then((document) => __awaiter(this, void 0, void 0, function* () {
                // Если предлождений для модерации нет
                if (!document) {
                    yield ctx.answerCbQuery('Предложений не найдено');
                    ctx.wizard.selectStep(0);
                    return yield (0, greeting_1.default)(ctx).catch(() => { ctx.answerCbQuery('Предложений не найдено'); });
                }
                else {
                    // Если есть предложения для модерации сохраняем его в контекст
                    if (document._id) {
                        ctx.session.__scenes.moderation_sentence = document._id;
                    }
                    // Инициализируем переменные
                    let message = `<b>Модерация</b> \n\n`;
                    let extra = {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: '👍',
                                        callback_data: 'good'
                                    },
                                    {
                                        text: '👎',
                                        callback_data: 'bad'
                                    }
                                ],
                                [
                                    {
                                        text: 'Назад',
                                        callback_data: 'back'
                                    }
                                ]
                            ]
                        }
                    };
                    const options = {
                        weekday: 'short', // короткое название дня недели, например 'Пн'
                        year: 'numeric', // год, например '2023'
                        month: 'short', // короткое название месяца, например 'апр'
                        day: 'numeric', // число месяца, например '21'
                        hour: 'numeric', // часы, например '17'
                        minute: 'numeric', // минуты, например '14'
                        second: 'numeric', // секунды, например '33'
                    };
                    const formattedDate = document.createdAt.toLocaleDateString('ru-RU', options); // 'Пн, 21 апр. 2023'
                    message += `${document.text} \n\n`;
                    message += `<pre>${formattedDate}</pre>`;
                    if (ctx.updateType === 'callback_query') {
                        yield ctx.editMessageText(message, extra);
                        ctx.wizard.selectStep(1);
                        ctx.answerCbQuery();
                    }
                    else {
                        yield ctx.reply(message, extra);
                    }
                }
            }));
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = moderation_sentences_render;
//# sourceMappingURL=sentencesRender.js.map