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
const axios_1 = __importDefault(require("axios"));
const telegraf_1 = require("telegraf");
const greeting_1 = __importDefault(require("./vocabularView/greeting"));
const IUser_1 = require("../../models/IUser");
const IBuryatWord_1 = require("../../models/vocabular/IBuryatWord");
const IRussianWord_1 = require("../../models/vocabular/IRussianWord");
const IVocabular_1 = require("../../models/IVocabular");
const handler = new telegraf_1.Composer();
const vocabular = new telegraf_1.Scenes.WizardScene("vocabular", handler, (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield translate_word(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield add_pair_handler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield add_translate_handler(ctx); }));
function add_translate_handler(ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'message') {
                if (ctx.update.message) {
                    if (ctx.update.message.text) {
                        if (ctx.message.text === `/back`) {
                            return yield (0, greeting_1.default)(ctx);
                        }
                        else {
                            const russian_phrase = ctx.scene.session.russian_dict_word;
                            const buryat_phrase = ctx.message.text;
                            ctx.scene.session.buryat_dict_word = buryat_phrase;
                            const extra = {
                                parse_mode: 'HTML',
                                reply_markup: {
                                    inline_keyboard: [
                                        [{ text: 'Отправить на проверку', callback_data: 'save' }],
                                        [{ text: 'Заполнить заново', callback_data: 'again' }],
                                        [{ text: 'Назад', callback_data: 'back' }]
                                    ]
                                }
                            };
                            return yield ctx.reply(`${russian_phrase} - ${buryat_phrase}`, extra);
                        }
                    }
                }
            }
            if (ctx.updateType === 'callback_query') {
                let data = ctx.update.callback_query.data;
                if (data === 'back') {
                    return yield (0, greeting_1.default)(ctx);
                }
                if (data === 'again') {
                    return yield add_pair(ctx);
                }
                if (data === 'save') {
                    const user = yield IUser_1.User.findOne({
                        id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id
                    });
                    if (user) {
                        const author = user._id;
                        const create_buryat_word = new IBuryatWord_1.buryatWordModel({ value: ctx.scene.session.buryat_dict_word, author }).save();
                        const create_russian_word = new IRussianWord_1.russianWordModel({ value: ctx.scene.session.russian_dict_word, author }).save();
                        yield new IVocabular_1.translationPairModel({
                            russian_word: [(yield create_russian_word)._id],
                            buryat_word: [(yield create_buryat_word)._id],
                            author: [author],
                            status: 0
                        }).save().then((response) => __awaiter(this, void 0, void 0, function* () {
                            const id1 = (yield create_buryat_word)._id;
                            const id2 = (yield create_russian_word)._id;
                            yield IBuryatWord_1.buryatWordModel.findByIdAndUpdate(id1, {
                                $addToSet: {
                                    translations: response._id
                                }
                            });
                            yield IRussianWord_1.russianWordModel.findByIdAndUpdate(id2, {
                                $addToSet: {
                                    translations: response._id
                                }
                            });
                            yield IUser_1.User.findByIdAndUpdate(author, {
                                $addToSet: {
                                    'dictionary_section.suggested_words_on_dictionary.suggested': response._id
                                }
                            });
                        }));
                    }
                    ctx.answerCbQuery('Ваша фраза отправлена на проверку');
                    return yield (0, greeting_1.default)(ctx);
                }
            }
        }
        catch (error) {
            yield (0, greeting_1.default)(ctx);
            console.error(error);
        }
    });
}
function add_pair_handler(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                let data = ctx.update.callback_query.data;
                if (data === 'back') {
                    ctx.wizard.selectStep(0);
                    yield (0, greeting_1.default)(ctx);
                }
                ctx.answerCbQuery();
            }
            else {
                if (ctx.message.text === '/back') {
                    yield (0, greeting_1.default)(ctx);
                    ctx.wizard.selectStep(0);
                }
                else if (ctx.message) {
                    ctx.scene.session.russian_dict_word = ctx.message.text;
                    let message = `Теперь отправьте перевод на бурятском языке к введеному тексту: <code>${ctx.message.text}</code>`;
                    message += `\n\n— Буквы отсутствующие в кириллице — <code>һ</code>, <code>ү</code>, <code>өө</code>, копируем из предложенных.\n\n`;
                    let extra = {
                        parse_mode: 'HTML'
                    };
                    yield ctx.reply(message, extra)
                        .then(() => __awaiter(this, void 0, void 0, function* () {
                        ctx.wizard.selectStep(3);
                    }));
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function add_pair(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            ctx.wizard.selectStep(2);
            let message = '<b>Дополнить словарь</b>\n\n';
            message += `Отправьте слово или фразу на <b>русском языке</b>, к которому хотите добавить перевод на бурятском\n\n`;
            message += `Чтобы вернуться назад отправьте команду /back`;
            const extra = { parse_mode: 'HTML' };
            if (ctx.updateType === 'callback_query') {
                yield ctx.editMessageText(message, extra);
            }
            else {
                yield ctx.reply(message, extra);
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function translate_word(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                if (ctx.callbackQuery) {
                    //@ts-ignore
                    if (ctx.callbackQuery.data) {
                        // @ts-ignore
                        let data = ctx.callbackQuery.data;
                        if (data === "back") {
                            ctx.wizard.selectStep(0);
                            yield (0, greeting_1.default)(ctx);
                        }
                        if (data === 'add_pair') {
                            yield add_pair(ctx);
                            ctx.answerCbQuery();
                        }
                    }
                }
            }
            if (ctx.updateType === 'message') {
                if (ctx.message) {
                    if (ctx.message.text) {
                        // @ts-ignore
                        let word = ctx.message.text;
                        let language = ctx.session.language;
                        let response = yield axios_1.default.get(`https://burlang.ru/api/v1/${language}/translate?q=${word}`)
                            .then(function (response) {
                            return response.data;
                        })
                            .catch(function (error) {
                            return error;
                        });
                        let message = '';
                        if (response.translations) {
                            message = response.translations[0].value;
                        }
                        else {
                            if (language === 'russian-word') {
                                message = 'Перевод отсутствует';
                            }
                            else {
                                message = 'Оршуулга угы байна..';
                            }
                        }
                        yield ctx.reply(message, {
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
                        });
                    }
                    else {
                        yield ctx.reply("Нужно отправить в текстовом виде");
                    }
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    });
}
vocabular.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, greeting_1.default)(ctx); }));
handler.action("back", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.answerCbQuery();
    return ctx.scene.enter("home");
}));
vocabular.action("russian", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.answerCbQuery();
    ctx.wizard.selectStep(1);
    ctx.session.language = 'russian-word';
    yield render_translate_section(ctx);
}));
vocabular.action("buryat", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.answerCbQuery();
    ctx.wizard.selectStep(1);
    ctx.session.language = 'buryat-word';
    yield render_translate_section(ctx);
}));
vocabular.action('add_pair', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    ctx.answerCbQuery();
    ctx.wizard.selectStep(2);
    yield add_pair(ctx);
}));
function render_translate_section(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let message = 'Отправьте слово которое нужно перевести';
            yield ctx.editMessageText(message, {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'назад',
                                callback_data: 'back'
                            }
                        ]
                    ]
                }
            });
        }
        catch (err) {
            console.log(err);
        }
    });
}
handler.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, greeting_1.default)(ctx); }));
exports.default = vocabular;
//# sourceMappingURL=vocabular.scene.js.map