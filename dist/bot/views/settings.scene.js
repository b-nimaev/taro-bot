"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const telegraf_1 = require("telegraf");
const greeting_1 = __importDefault(require("./settingsView/greeting"));
const date_of_birth_1 = __importStar(require("./settingsView/date_of_birth"));
const IUser_1 = require("../../models/IUser");
const handler = new telegraf_1.Composer();
const settings = new telegraf_1.Scenes.WizardScene("settings", handler, (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, date_of_birth_1.default)(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, date_of_birth_1.date_birth_get_years_handler)(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield select_year(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield select_ln(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield select_day(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield choose_gender_handler(ctx); }));
function select_day(ctx) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                if (ctx.update.callback_query.data.indexOf('day') !== -1) {
                    const date_of_birth = `${parseFloat(ctx.update.callback_query.data.replace('day', ''))}.${ctx.scene.session.mounth}.${ctx.scene.session.year}`;
                    return yield IUser_1.User.findOneAndUpdate({
                        id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id
                    }, {
                        $set: {
                            date_of_birth: {
                                day: parseFloat(ctx.update.callback_query.data.replace('day', '')),
                                mounth: ctx.scene.session.mounth,
                                year: ctx.scene.session.year
                            }
                        }
                    }).then((res) => __awaiter(this, void 0, void 0, function* () {
                        console.log(res);
                        yield (0, greeting_1.default)(ctx);
                    })).catch((error) => __awaiter(this, void 0, void 0, function* () {
                        yield (0, greeting_1.default)(ctx);
                        console.error(error);
                    }));
                }
                const days = yield getDaysInMonth(ctx.scene.session.mounth, ctx.scene.session.year);
                // ctx.editMessageText(`Укажите день рождения 1 - ${days}`)
                let extra = {
                    parse_mode: 'HTML',
                    reply_markup: {
                        inline_keyboard: []
                    }
                };
                let row = [];
                for (let i = 1; i < days + 1; i++) {
                    // extra.reply_markup?.inline_keyboard.push()
                    row.push({ callback_data: `day ${i}`, text: `${i}` });
                    if (i % 5 === 0) {
                        (_b = extra.reply_markup) === null || _b === void 0 ? void 0 : _b.inline_keyboard.push(row);
                        row = [];
                    }
                    if (days === 31 && i === 31) {
                        (_c = extra.reply_markup) === null || _c === void 0 ? void 0 : _c.inline_keyboard.push(row);
                    }
                    if (days === 29 && i === 29) {
                        (_d = extra.reply_markup) === null || _d === void 0 ? void 0 : _d.inline_keyboard.push(row);
                    }
                    if (days === 28 && i === 28) {
                        (_e = extra.reply_markup) === null || _e === void 0 ? void 0 : _e.inline_keyboard.push(row);
                    }
                }
                let message = `Укажите день рождения`;
                yield ctx.editMessageText(message, extra);
            }
            else {
                if (ctx.updateType === 'message') {
                    if (ctx.update.message.text) {
                        const days = yield getDaysInMonth(ctx.scene.session.mounth, ctx.scene.session.year);
                        ctx.reply(`Укажите день рождения 1 - ${days}`);
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function getDaysInMonth(month, year) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Date(year, month, 0).getDate();
    });
}
function select_year(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                if (ctx.update.callback_query.data === 'back') {
                    yield (0, date_of_birth_1.date_birth_get_years)(ctx);
                    ctx.wizard.selectStep(2);
                }
                else {
                    ctx.scene.session.year = parseFloat(ctx.update.callback_query.data);
                    console.log(ctx.scene.session.mounth);
                    console.log(ctx.scene.session.year);
                    ctx.wizard.selectStep(5);
                    yield select_day(ctx);
                }
                ctx.answerCbQuery(ctx.update.callback_query.data);
                // ctx.update.callback_query.data
                // ctx.scene.session.mounth
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function choose_gender_handler(ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                let data = ctx.update.callback_query.data;
                if (data === 'male' || data === 'female') {
                    return yield IUser_1.User.findOneAndUpdate({
                        id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id
                    }, {
                        $set: {
                            gender: data
                        }
                    }).then(() => __awaiter(this, void 0, void 0, function* () {
                        yield ctx.answerCbQuery();
                        yield (0, greeting_1.default)(ctx);
                    }));
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
settings.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, greeting_1.default)(ctx); }));
settings.action("choose_gender", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let message = `Укажите ваш пол`;
        let extra = {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Мужчина', callback_data: 'male' }],
                    [{ text: 'Женщина', callback_data: 'female' }]
                ]
            }
        };
        if (ctx.updateType === 'callback_query') {
            ctx.answerCbQuery();
            yield ctx.editMessageText(message, extra);
        }
        else {
            yield ctx.reply(message, extra);
        }
        ctx.wizard.selectStep(6);
    }
    catch (error) {
        console.error(error);
    }
}));
handler.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, greeting_1.default)(ctx); }));
handler.action("back", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    // await ctx.answerCbQuery()
    return ctx.scene.enter("dashboard");
}));
settings.action("choose_ln", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield render_choose_ln_section(ctx);
    }
    catch (error) {
        console.error(error);
    }
    return ctx.answerCbQuery();
}));
function render_choose_ln_section(ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let user = yield IUser_1.User.findOne({
                id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id
            });
            let message = `<b>Выберите язык интерфейса</b> \n\n`;
            message += `Выбранный язык: ${user === null || user === void 0 ? void 0 : user.interface_language}`;
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Русский', callback_data: 'russian' }],
                        [{ text: 'Бурятский', callback_data: 'buryat' }],
                        [{ text: 'Английский', callback_data: 'english' }],
                        [{ text: 'Назад', callback_data: 'back' }]
                    ]
                }
            };
            yield ctx.editMessageText(message, extra);
            ctx.wizard.selectStep(4);
        }
        catch (error) {
            console.error(error);
        }
    });
}
function select_ln(ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                let data = ctx.update.callback_query.data;
                if (data === 'back') {
                    ctx.wizard.selectStep(0);
                    return ctx.scene.enter("settings");
                }
                yield IUser_1.User.findOneAndUpdate({
                    id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id
                }, { $set: {
                        interface_language: data
                    } });
                yield render_choose_ln_section(ctx);
                ctx.answerCbQuery(data);
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
settings.action("choose_gender", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return ctx.answerCbQuery();
}));
settings.action("date_birth", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, date_of_birth_1.date_birth)(ctx); }));
exports.default = settings;
//# sourceMappingURL=settings.scene.js.map