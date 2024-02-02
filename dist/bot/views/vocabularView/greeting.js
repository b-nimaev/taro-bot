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
function greeting(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Русский',
                                callback_data: 'russian'
                            },
                            {
                                text: 'Бурятский',
                                callback_data: 'buryat'
                            }
                        ],
                        [
                            {
                                text: 'Дополнить словарь',
                                callback_data: 'add_pair'
                            }
                        ],
                        [
                            {
                                text: 'Назад',
                                callback_data: 'back'
                            }
                        ],
                    ]
                }
            };
            let message = `<b>Словарь</b> \n\nВыберите язык с которого нужно перевести`;
            ctx.updateType === 'message' ? yield ctx.reply(message, extra) : false;
            ctx.updateType === 'callback_query' ? yield ctx.editMessageText(message, extra) : false;
            ctx.wizard.selectStep(0);
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.default = greeting;
//# sourceMappingURL=greeting.js.map