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
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[
                            {
                                text: 'Указать пол',
                                callback_data: 'choose_gender'
                            }
                        ],
                        [
                            {
                                text: 'Указать дату рождения',
                                callback_data: 'date_birth'
                            }
                        ],
                        [{
                                text: 'Выбрать язык интерфейса',
                                callback_data: 'choose_ln'
                            }
                        ],
                        [{
                                text: 'Назад',
                                callback_data: 'back'
                            }],
                    ]
                }
            };
            let message = '';
            if (ctx.from) {
                if ((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.first_name) {
                    message = `<b>Личный кабинет / Настройки</b> \n\nИмя пользователя: <b>${(_b = ctx.from) === null || _b === void 0 ? void 0 : _b.first_name}</b>`;
                }
                else {
                    message = `<b>Настройки</b> \n\nИмя пользователя: <b>${(_c = ctx.from) === null || _c === void 0 ? void 0 : _c.id}</b>`;
                }
            }
            const user = yield IUser_1.User.findOne({ id: (_d = ctx.from) === null || _d === void 0 ? void 0 : _d.id });
            console.log(user);
            if (user === null || user === void 0 ? void 0 : user.date_of_birth) {
                let day = user.date_of_birth.day;
                if (day) {
                    if (day < 10) {
                        day = `0${day}`;
                    }
                }
                let mounth = user.date_of_birth.mounth;
                if (mounth) {
                    if (mounth < 10) {
                        mounth = `0${mounth}`;
                    }
                }
                message += `\nДата рождения: <b>${day}.${mounth}.${user.date_of_birth.year}</b>`;
            }
            // message += `\nДата рождения: 07.08.2000`
            // message += `\nЯзык интерфейса: Русский`
            if (user === null || user === void 0 ? void 0 : user.interface_language) {
                let interface_lang = `Русский язык`;
                if (user.interface_language) {
                    if (user.interface_language === 'english') {
                        interface_lang = 'English language';
                    }
                    else if (user.interface_language === 'buryat') {
                        interface_lang = 'Буряд хэлэн';
                    }
                    else {
                        interface_lang = 'Русский язык';
                    }
                }
                message += `\nЯзык интерфейса: <b>${interface_lang}</b>`;
            }
            if (user === null || user === void 0 ? void 0 : user.gender) {
                if (user.gender === 'male') {
                    message += `\nВаш пол: <b>Мужской</b>`;
                }
                else {
                    message += `\nВаш пол: <b>Женский</b>`;
                }
            }
            message += `\n\nДата регистрации: <b>${yield get_date(user === null || user === void 0 ? void 0 : user.createdAt)}</b>`;
            ctx.updateType === 'message' ? yield ctx.reply(message, extra) : false;
            ctx.updateType === 'callback_query' ? yield ctx.editMessageText(message, extra) : false;
            ctx.wizard.selectStep(0);
        }
        catch (err) {
            console.error(err);
        }
    });
}
exports.default = greeting;
function get_date(createdat) {
    return __awaiter(this, void 0, void 0, function* () {
        const year = new Date(createdat).getFullYear();
        const month = String(new Date(createdat).getMonth() + 1).padStart(2, "0");
        const day = String(new Date(createdat).getDate()).padStart(2, "0");
        return `${day}.${month}.${year}`;
    });
}
//# sourceMappingURL=greeting.js.map