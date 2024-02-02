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
const telegraf_1 = require("telegraf");
const ISentence_1 = require("../../models/ISentence");
const IUser_1 = require("../../models/IUser");
const greeting_1 = __importDefault(require("./moderationView/greeting"));
const IVocabular_1 = require("../../models/IVocabular");
const IBuryatWord_1 = require("../../models/vocabular/IBuryatWord");
const IRussianWord_1 = require("../../models/vocabular/IRussianWord");
/**
 * Report section
 */
const reportHandler_1 = __importDefault(require("./moderationView/reportHandler"));
const reportRender_1 = __importDefault(require("./moderationView/reportRender"));
/**
 * Sentences section
 */
const sentencesRender_1 = __importDefault(require("./moderationView/sentencesRender"));
const moderationTranslates_1 = __importDefault(require("./moderationView/moderationTranslates"));
const sentencesHandler_1 = __importDefault(require("./moderationView/sentencesHandler"));
const handler = new telegraf_1.Composer();
const moderation = new telegraf_1.Scenes.WizardScene("moderation", handler, (ctx) => __awaiter(void 0, void 0, void 0, function* () { return (0, sentencesHandler_1.default)(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return moderation_translates_handler(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return (0, reportHandler_1.default)(ctx); }), (ctx) => __awaiter(void 0, void 0, void 0, function* () { return moderation_vocabular_handler(ctx); }));
moderation.enter((ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, greeting_1.default)(ctx); }));
moderation.action("moderation_sentences", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, sentencesRender_1.default)(ctx); }));
moderation.action("report", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, reportRender_1.default)(ctx); }));
moderation.action("moderation_translates", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, moderationTranslates_1.default)(ctx); }));
function updateRating(translation) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Получаем рейтинг ...');
        // получаем все голоса перевода
        const votes = yield ISentence_1.Translation.findById(translation)
            .then((document) => __awaiter(this, void 0, void 0, function* () {
            if (document) {
                return document.votes;
            }
            else {
                return false;
            }
        })).catch((error) => __awaiter(this, void 0, void 0, function* () {
            console.error(error);
            return false;
        }));
        if (votes === false) {
            return false;
        }
        else {
            // if (typeof (votes) === 'undefined' || typeof (votes) !== 'boolean') {
            //     return false
            // }
            console.log(votes);
            let rating = 0;
            let pluses = 0;
            let minuses = 0;
            if (!votes) {
                return false;
            }
            // @ts-ignore
            for (let i = 0; i < votes.length; i++) {
                // @ts-ignore
                let voteDocument = yield ISentence_1.voteModel.findById(votes[i]);
                if (voteDocument) {
                    if (voteDocument.vote === true) {
                        pluses = pluses + 1;
                    }
                    else {
                        minuses = minuses + 1;
                    }
                }
            }
            console.log(`pluses: ${pluses}`);
            console.log(`minuses: ${minuses}`);
            rating = pluses - minuses;
            // console.log(rating)
            return rating;
        }
    });
}
function ratingHandler(translation) {
    return __awaiter(this, void 0, void 0, function* () {
        if (translation) {
            if (!translation) {
                return false;
            }
            const rating = yield updateRating(translation);
            console.log(rating);
            if (rating) {
                yield ISentence_1.Translation.findByIdAndUpdate(translation, {
                    $set: {
                        rating: rating
                    }
                }).then((newtranslation) => __awaiter(this, void 0, void 0, function* () {
                    if (rating >= 5) {
                        yield new ISentence_1.ConfirmedTranslations(newtranslation).save();
                        yield ISentence_1.Translation.findByIdAndDelete(newtranslation === null || newtranslation === void 0 ? void 0 : newtranslation._id);
                    }
                }));
            }
        }
    });
}
// обрабатываем голос
function moderation_translates_handler(ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (ctx.updateType === 'callback_query') {
            // сохраняем коллбэк
            let data = ctx.update.callback_query.data;
            let translate_id = ctx.scene.session.current_translation_for_vote;
            let user = yield IUser_1.User.findOne({ id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id });
            if (!user) {
                return (0, greeting_1.default)(ctx);
            }
            if (data === 'good' || data === 'bad' || data === 'dontknow') {
                if (data === 'dontknow') {
                    return yield ISentence_1.Translation.findByIdAndUpdate(translate_id, { $push: { skipped_by: user._id } }).then(() => __awaiter(this, void 0, void 0, function* () {
                        yield (0, moderationTranslates_1.default)(ctx);
                    }));
                }
                else {
                    let vote = data === 'good' ? true : false;
                    // Сохраняем голос +
                    yield new ISentence_1.voteModel({ user_id: user === null || user === void 0 ? void 0 : user._id, translation_id: translate_id, vote: vote }).save().then((data) => __awaiter(this, void 0, void 0, function* () {
                        // Возвращаем _id сохранненого голоса
                        let vote_id = data._id;
                        // пушим в массив голосов докумена перевода
                        yield ISentence_1.Translation.findByIdAndUpdate(translate_id, { $push: { votes: vote_id } });
                        yield ISentence_1.Translation.findByIdAndUpdate(translate_id, { $push: { voted_by: user._id } });
                        yield ratingHandler(translate_id);
                        yield IUser_1.User.findOneAndUpdate({ _id: user === null || user === void 0 ? void 0 : user._id }, { $addToSet: { voted_translations: translate_id } });
                    }));
                    yield (0, moderationTranslates_1.default)(ctx);
                }
            }
            if (data === 'addTranslate') {
            }
            // Если чел хочет вернутьтся на начальный экран модерации
            if (data === 'back') {
                ctx.wizard.selectStep(0);
                yield (0, greeting_1.default)(ctx);
            }
            ctx.answerCbQuery();
        }
        else {
            yield (0, moderationTranslates_1.default)(ctx);
        }
    });
}
moderation.action("moderation_vocabular", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield moderation_vocabular(ctx); }));
function moderation_vocabular_handler(ctx) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (ctx.updateType === 'callback_query') {
                const data = ctx.update.callback_query.data;
                ctx.answerCbQuery(data);
                if (data === 'good') {
                    yield IVocabular_1.translationPairModel.findByIdAndUpdate(ctx.scene.session.moderation_vocabular_active, {
                        $set: {
                            status: 2
                        }
                    });
                    return yield moderation_vocabular(ctx);
                }
                if (data === 'bad') {
                    yield IVocabular_1.translationPairModel.findByIdAndUpdate(ctx.scene.session.moderation_vocabular_active, {
                        $set: {
                            status: 1
                        }
                    });
                    return yield moderation_vocabular(ctx);
                }
                if (data === 'skip') {
                    const user = yield IUser_1.User.findOne({
                        id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id
                    });
                    yield IVocabular_1.translationPairModel.findByIdAndUpdate(ctx.scene.session.moderation_vocabular_active, {
                        $set: {
                            status: 0
                        },
                        $addToSet: {
                            skipped_by: user === null || user === void 0 ? void 0 : user._id
                        }
                    });
                    return yield moderation_vocabular(ctx);
                }
                if (data === 'report_on_variant') {
                    ctx.answerCbQuery('report_on_variant');
                    return yield moderation_vocabular(ctx);
                }
                if (data === 'back') {
                    yield ctx.scene.enter('moderation');
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
function moderation_vocabular(ctx) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield IUser_1.User.findOne({ id: (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id });
            let message = `Модерация словаря \n\n`;
            // const pair: translation_pair | null = await translationPairModel.findOne({
            // status: 0
            // })
            const pair = yield IVocabular_1.translationPairModel.aggregate([
                { $match: { skipped_by: { $ne: user === null || user === void 0 ? void 0 : user._id }, status: 0 } },
                { $project: { buryat_word: 1, russian_word: 1, author: 1 } },
                { $limit: 1 }
            ]).then((doc) => __awaiter(this, void 0, void 0, function* () {
                return doc[0];
            }));
            if (!pair) {
                if (ctx.updateType === 'callback_query') {
                    yield (0, greeting_1.default)(ctx);
                    ctx.wizard.selectStep(0);
                    return yield ctx.answerCbQuery('Не найдено предложенных слов в словарь');
                }
                else {
                    yield ctx.reply(`Не найдено предложенных слов в словарь`);
                    return yield (0, greeting_1.default)(ctx);
                }
            }
            const author = yield IUser_1.User.findById(pair === null || pair === void 0 ? void 0 : pair.author);
            ctx.scene.session.moderation_vocabular_active = pair === null || pair === void 0 ? void 0 : pair._id;
            const buryat_word = yield IBuryatWord_1.buryatWordModel.findById(pair === null || pair === void 0 ? void 0 : pair.buryat_word[0]);
            const russian_word = yield IRussianWord_1.russianWordModel.findById(pair === null || pair === void 0 ? void 0 : pair.russian_word[0]);
            message += `${russian_word === null || russian_word === void 0 ? void 0 : russian_word.value} — ${buryat_word === null || buryat_word === void 0 ? void 0 : buryat_word.value} \n\n`;
            message += `Автор: <code>${pair === null || pair === void 0 ? void 0 : pair.author}</code> \n`;
            message += `Рейтинг автора: ${author === null || author === void 0 ? void 0 : author.rating} \n`;
            const extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '👍', callback_data: 'good' },
                            { text: 'Не знаю', callback_data: 'skip' },
                            { text: '👎', callback_data: 'bad' }
                        ],
                        [{ text: 'Предложить перевод', callback_data: 'suggest_translate' }],
                        [{ text: 'Пожаловаться', callback_data: 'report_on_variant' }],
                        [{ text: 'Назад', callback_data: 'back' }]
                    ]
                }
            };
            // тут нужно в message передать модерируемую пару слов !!!
            if (ctx.updateType === 'callback_query') {
                if (((_b = user === null || user === void 0 ? void 0 : user.permissions) === null || _b === void 0 ? void 0 : _b.admin) || ((_c = user === null || user === void 0 ? void 0 : user.permissions) === null || _c === void 0 ? void 0 : _c.dictionary_moderator)) {
                    ctx.wizard.selectStep(4);
                    return yield ctx.editMessageText(message, extra);
                }
                else {
                    return ctx.answerCbQuery('Недостаточно прав');
                }
            }
            else {
                if (((_d = user === null || user === void 0 ? void 0 : user.permissions) === null || _d === void 0 ? void 0 : _d.admin) || ((_e = user === null || user === void 0 ? void 0 : user.permissions) === null || _e === void 0 ? void 0 : _e.dictionary_moderator)) {
                    ctx.wizard.selectStep(4);
                    return yield ctx.reply(message, extra);
                }
                else {
                    return ctx.reply('Недостаточно прав');
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    });
}
handler.on("message", (ctx) => __awaiter(void 0, void 0, void 0, function* () { return yield (0, greeting_1.default)(ctx); }));
handler.action("back", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield ctx.answerCbQuery();
    return ctx.scene.enter("home");
}));
exports.default = moderation;
//# sourceMappingURL=moderation.scene.js.map