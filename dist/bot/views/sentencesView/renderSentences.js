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
exports.render_sentencse_for_translate = void 0;
const getTranslations_1 = __importDefault(require("./getTranslations"));
function render_sentencse_for_translate(ctx, sentence) {
    return __awaiter(this, void 0, void 0, function* () {
        let message = '';
        if (sentence) {
            message += `<b>Отправьте перевод предложения: </b>\n\n`;
            message += `<code>${sentence.text}</code>`;
            message += `\n\n— Буквы отсутствующие в кириллице — <code>һ</code>, <code>ү</code>, <code>өө</code>, копируем из предложенных.\n\n`;
            // message += `— Чтобы пропустить, нажмите /skip`
            if (sentence.translations) {
                if (sentence.translations.length) {
                    // получаем существующие переводы
                    const translations = yield (0, getTranslations_1.default)(ctx, sentence);
                    // если они существуют
                    if (translations) {
                        // переводы посторонних
                        if (translations.common_translation.length) {
                            message += `\n\n<i>Переводы пользователей</i>`;
                            for (let i = 0; i < translations.common_translation.length; i++) {
                                message += `\n${i + 1}) ${translations.common_translation[i].translate_text}`;
                            }
                        }
                        // ваши переводы
                        if (translations.author_translation.length) {
                            message += `\n\n<i>Ваши переводы</i>`;
                            for (let i = 0; i < translations.author_translation.length; i++) {
                                message += `\n${i + 1}) ${translations.author_translation[i].translate_text}`;
                            }
                        }
                    }
                }
            }
            // тут вывести переводы
            ctx.wizard.selectStep(4);
            return message;
        }
    });
}
exports.render_sentencse_for_translate = render_sentencse_for_translate;
//# sourceMappingURL=renderSentences.js.map