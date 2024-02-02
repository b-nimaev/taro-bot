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
function greeting(ctx) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = `<b>Модерация</b>\n\n`;
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: []
                }
            };
            const user = yield IUser_1.User.findOne({ id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id });
            message += `Количество голосов: <b>${user.voted_translations.length}</b>`;
            if ((_b = user === null || user === void 0 ? void 0 : user.permissions) === null || _b === void 0 ? void 0 : _b.admin) {
                (_c = extra.reply_markup) === null || _c === void 0 ? void 0 : _c.inline_keyboard.push([{ text: 'Модерация предложений', callback_data: 'moderation_sentences' }]);
                (_d = extra.reply_markup) === null || _d === void 0 ? void 0 : _d.inline_keyboard.push([{ text: 'Модерация переводов', callback_data: 'moderation_translates' }]);
                (_e = extra.reply_markup) === null || _e === void 0 ? void 0 : _e.inline_keyboard.push([{ text: 'Модерация словаря', callback_data: 'moderation_vocabular' }]);
            }
            else {
                if ((_f = user === null || user === void 0 ? void 0 : user.permissions) === null || _f === void 0 ? void 0 : _f.dictionary_moderator) {
                    (_g = extra.reply_markup) === null || _g === void 0 ? void 0 : _g.inline_keyboard.push([{ text: 'Модерация словаря', callback_data: 'moderation_vocabular' }]);
                }
                if ((_h = user === null || user === void 0 ? void 0 : user.permissions) === null || _h === void 0 ? void 0 : _h.sentences_moderator) {
                    (_j = extra.reply_markup) === null || _j === void 0 ? void 0 : _j.inline_keyboard.push([{ text: 'Модерация предложений', callback_data: 'moderation_sentences' }]);
                }
                if ((_k = user === null || user === void 0 ? void 0 : user.permissions) === null || _k === void 0 ? void 0 : _k.translation_moderator) {
                    (_l = extra.reply_markup) === null || _l === void 0 ? void 0 : _l.inline_keyboard.push([{ text: 'Модерация переводов', callback_data: 'moderation_translates' }]);
                }
            }
            (_m = extra.reply_markup) === null || _m === void 0 ? void 0 : _m.inline_keyboard.push([{ text: 'Назад', callback_data: 'back' }]);
            ctx.updateType === 'message' ? yield ctx.reply(message, extra) : false;
            ctx.updateType === 'callback_query' ? yield ctx.editMessageText(message, extra) : false;
            ctx.wizard.selectStep(0);
        }
        catch (err) {
            // console.error(err);
        }
    });
}
exports.default = greeting;
//# sourceMappingURL=greeting.js.map