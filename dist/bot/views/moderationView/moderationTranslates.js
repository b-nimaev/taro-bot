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
exports.moderation_translates = void 0;
const ISentence_1 = require("../../../models/ISentence");
const greeting_1 = __importDefault(require("./greeting"));
const IUser_1 = require("../../../models/IUser");
function moderation_translates(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // await render_vote_sentence(ctx)
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.moderation_translates = moderation_translates;
function moderation_translates_render(ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield IUser_1.User.findOne({ id: ctx.from.id });
            if (!user) {
                return (0, greeting_1.default)(ctx);
            }
            // получаем перевод и предложение которое переведено
            let translation = yield ISentence_1.Translation.aggregate([
                { $sort: { rating: -1 } },
                { $match: { reported: false, skipped_by: { $nin: [user._id] }, voted_by: { $nin: [user._id] } } },
                { $limit: 1 }
            ]).then((response) => __awaiter(this, void 0, void 0, function* () { return response[0]; })).catch((err) => __awaiter(this, void 0, void 0, function* () { console.error(err); }));
            if (!translation) {
                if (ctx.updateType === 'callback_query') {
                    ctx.answerCbQuery('Предложений не найдено');
                    return yield (0, greeting_1.default)(ctx);
                }
            }
            if (translation === null || !translation._id) {
                return yield (0, greeting_1.default)(ctx);
            }
            const sentence_russian = yield ISentence_1.Sentence.findById(translation.sentence_russian);
            // если перевод найден сохраним его в контекст
            if (translation) {
                ctx.scene.session.current_translation_for_vote = translation._id;
            }
            // текст
            let message = `<b>Модерация / Голосование</b>\n\n`;
            message += `Предложение  \n\n<pre>${sentence_russian === null || sentence_russian === void 0 ? void 0 : sentence_russian.text}</pre>\n`;
            // message += `Количество переводов: ${sentence_russian?.translations.length}\n\n`
            message += `\n\nПеревод \n\n`;
            message += `<pre>${translation === null || translation === void 0 ? void 0 : translation.translate_text}</pre>\n\n`;
            const options = {
                weekday: 'short', // короткое название дня недели, например 'Пн'
                year: 'numeric', // год, например '2023'
                month: 'short', // короткое название месяца, например 'апр'
                day: 'numeric', // число месяца, например '21'
                hour: 'numeric', // часы, например '17'
                minute: 'numeric', // минуты, например '14'
                second: 'numeric', // секунды, например '33'
            };
            if (sentence_russian) {
                const formattedDate = sentence_russian.createdAt.toLocaleDateString('ru-RU', options); // 'Пн, 21 апр. 2023'
                message += `<pre>${formattedDate}</pre>`;
            }
            let statistic = {
                plus: [],
                minus: []
            };
            // console.log(sentence_russian)
            if (translation) {
                if (translation.votes) {
                    if (translation.votes.length) {
                        for (let i = 0; i < translation.votes.length; i++) {
                            const voteID = translation.votes[i];
                            const vote = yield ISentence_1.voteModel.findOne({ _id: voteID });
                            if (vote === null || vote === void 0 ? void 0 : vote.vote) {
                                statistic.plus.push(vote);
                            }
                            else {
                                statistic.minus.push(vote);
                            }
                        }
                        let realRating = statistic.plus.length - statistic.minus.length;
                        yield ISentence_1.Translation.findByIdAndUpdate(translation._id, {
                            $set: {
                                rating: realRating
                            }
                        });
                        if (realRating == 3) {
                            yield new ISentence_1.ConfirmedTranslations(translation).save();
                            yield ISentence_1.Translation.findByIdAndDelete(translation === null || translation === void 0 ? void 0 : translation._id);
                        }
                        // message += `\n\nКоличество голосов: <pre>15+, 2-</pre>`
                    }
                }
            }
            let extra = {
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: `👍 ${statistic.plus.length}`,
                                callback_data: 'good'
                            },
                            {
                                text: `Не знаю`,
                                callback_data: 'dontknow'
                            },
                            {
                                text: `👎 ${statistic.minus.length}`,
                                callback_data: 'bad'
                            }
                        ],
                        [
                            {
                                text: 'Предложить перевод',
                                callback_data: 'addTranslate'
                            }
                        ],
                        [
                            {
                                text: 'Пожаловаться',
                                callback_data: 'report'
                            }
                        ],
                        [
                            {
                                text: 'Назад',
                                callback_data: 'back'
                            }
                        ]
                    ]
                }
            };
            if (ctx.updateType === 'callback_query') {
                ctx.editMessageText(message, extra);
                ctx.answerCbQuery();
            }
            else {
                ctx.reply(message, extra);
            }
            ctx.wizard.selectStep(2);
        }
        catch (error) {
            ctx.wizard.selectStep(0);
            yield (0, greeting_1.default)(ctx);
            console.error(error);
        }
    });
}
exports.default = moderation_translates_render;
//# sourceMappingURL=moderationTranslates.js.map