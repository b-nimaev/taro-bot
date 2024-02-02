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
Object.defineProperty(exports, "__esModule", { value: true });
const IUser_1 = require("../../../models/IUser");
const chat_scene_1 = require("../chat.scene");
function greeting(ctx, reply) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `<b>Chat GPT</b>\n\n`;
            message += `Статус подписки: <b>Не активен</b>`;
            const user = yield IUser_1.User.findOne({ id: ctx.from.id });
            message += `\nДоступно токенов: <b>${user.access_tokens}</b> ${user.access_tokens > 0 ? '🔋' : '🪫'}`;
            // message += `\n1000 токенов 25 рублей
            message += `\n\n<b>Надстройки GPT:</b>\n`;
            message += `Модель GPT: <b>${user.gpt_model}</b>\n`;
            message += `max_tokens в запросе: <b>${user.max_tokens}</b>\n`;
            message += `температура: <b>0.${user.temperature}</b>`;
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Начать диалог', callback_data: 'new_chat' }],
                        [{ text: 'Мои диалоги', callback_data: 'list' }],
                        [{ text: 'Настройки', callback_data: 'settings-chat-gpt' }],
                        [
                            { text: 'Назад', callback_data: 'home' }, { text: 'FAQ', callback_data: 'instruction' },
                        ]
                    ]
                }
            };
            if (user) {
                yield (0, chat_scene_1.clear_chats)(user);
            }
            if (ctx.updateType === 'callback_query') {
                ctx.answerCbQuery();
                reply === true ? yield ctx.reply(message, extra) : yield ctx.editMessageText(message, extra);
            }
            else {
                yield ctx.reply(message, extra);
            }
            ctx.wizard.selectStep(0);
        }
        catch (error) {
            console.error(error);
        }
    });
}
exports.default = greeting;
//# sourceMappingURL=chat.greeting.js.map