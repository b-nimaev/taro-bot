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
exports.bot = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const telegraf_1 = require("telegraf");
dotenv_1.default.config();
exports.bot = new telegraf_1.Telegraf(process.env.bot);
require("./app");
const home_scene_1 = __importDefault(require("./bot/views/home.scene"));
const home_scene_2 = require("./bot/views/home.scene");
const app_1 = require("./app");
const stage = new telegraf_1.Scenes.Stage([home_scene_1.default], { default: 'home' });
exports.bot.use((0, telegraf_1.session)());
exports.bot.use(stage.middleware());
exports.bot.start((ctx) => __awaiter(void 0, void 0, void 0, function* () { yield ctx.scene.enter('home'); }));
exports.bot.action(/./, function (ctx) {
    return __awaiter(this, void 0, void 0, function* () {
        ctx.answerCbQuery();
        yield (0, home_scene_2.greeting)(ctx);
    });
});
(0, app_1.set_webhook)();
//# sourceMappingURL=index.js.map