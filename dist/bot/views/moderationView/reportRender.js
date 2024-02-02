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
const ISentence_1 = require("../../../models/ISentence");
function report_section_render(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = '<b>Модерация / Голосование / Жалоба</b>\n\n';
            const translation = yield ISentence_1.Translation.findById(ctx.scene.session.current_translation_for_vote);
            if (translation) {
                yield ISentence_1.Sentence.findById(translation.sentence_russian).then((sentence) => __awaiter(this, void 0, void 0, function* () {
                    if (sentence) {
                        message += `Предложение\n\n`;
                        message += `<code>${sentence.text}</code>\n\n`;
                        message += `Перевод\n\n`;
                        message += `<code>${translation.translate_text}</code>`;
                        message += `\n\n<b>Отправьте следующим сообщением, причину жалобы</b>`;
                    }
                }));
                const extra = { parse_mode: 'HTML', reply_markup: { inline_keyboard: [[{ text: 'Назад', callback_data: 'back' }]] } };
                if (ctx.updateType === 'callback_query') {
                    yield ctx.editMessageText(message, extra);
                    return ctx.wizard.selectStep(3);
                }
                else {
                    yield ctx.reply(message, extra);
                    return ctx.wizard.selectStep(3);
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.default = report_section_render;
//# sourceMappingURL=reportRender.js.map