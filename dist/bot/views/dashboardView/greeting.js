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
const IUser_1 = require("../../../models/IUser");
const format_money_1 = __importDefault(require("../../utlis/format_money"));
const ISentence_1 = require("../../../models/ISentence");
function greeting(ctx) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.from) {
                let user = yield IUser_1.User.findOne({ id: ctx.from.id });
                if (user) {
                    const extra = {
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'О проекте',
                                        callback_data: 'about'
                                    }
                                ],
                                [
                                    {
                                        text: 'Мои сообщения',
                                        callback_data: 'messages'
                                    }
                                ],
                                [
                                    {
                                        text: '💸 Поддержка проекта',
                                        callback_data: 'help'
                                    }
                                ],
                                [
                                    {
                                        text: 'Персональные данные',
                                        callback_data: 'common_settings'
                                    }
                                ],
                                [
                                    {
                                        text: 'Справочные материалы',
                                        callback_data: 'reference_materials'
                                    }
                                ],
                                [
                                    {
                                        text: 'Реферальная программа',
                                        callback_data: 'referral'
                                    }
                                ],
                                [
                                    {
                                        text: 'Назад',
                                        callback_data: 'home'
                                    },
                                    {
                                        text: 'Обратная связь',
                                        url: 'https://t.me/bur_live'
                                    }
                                ],
                            ]
                        }
                    };
                    const confirmatedTranslations = yield get_confirmated_translations(ctx.from.id);
                    let words = [];
                    let message = `<b>Личный кабинет</b> \n\n`;
                    message += `Рейтинг: ${user.rating} \n`;
                    // message += `Добавлено слов: 0 \n`
                    // message += `Слов на модерации: ${words.length} \n`
                    message += `Предложено предложений для перевода: ${(_a = user.proposed_proposals) === null || _a === void 0 ? void 0 : _a.length}\n`;
                    if (confirmatedTranslations) {
                        message += `Количество переведенных предложений: ${confirmatedTranslations.length} \n`;
                    }
                    message += `Количество голосов за перевод: ${(_b = user.voted_translations) === null || _b === void 0 ? void 0 : _b.length}`;
                    message += `\n\n<b>Внесено в проект ${(0, format_money_1.default)(user.supported)} ₽</b>`;
                    ctx.updateType === 'message' ? yield ctx.reply(message, extra) : false;
                    ctx.updateType === 'callback_query' ? yield ctx.editMessageText(message, extra) : false;
                }
                else {
                    console.log('123');
                }
            }
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.default = greeting;
function get_confirmated_translations(user_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield IUser_1.User.findOne({ id: user_id });
            if (!user || !user._id) {
                return false;
            }
            const docs = yield ISentence_1.ConfirmedTranslations.find({ author: user._id });
            return docs;
        }
        catch (error) {
            console.error(error);
        }
    });
}
//# sourceMappingURL=greeting.js.map