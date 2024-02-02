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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposedProposalModel = exports.User = exports.proposedProposalSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.proposedProposalSchema = new mongoose_1.Schema({
    id: { type: mongoose_1.default.Schema.Types.ObjectId, required: true },
    accepted: { type: Boolean, required: true, default: false },
}, {
    timestamps: true
});
const userSchema = new mongoose_1.Schema({
    id: { type: Number, required: true },
    username: { type: String, required: false },
    first_name: { type: String, required: false },
    last_name: { type: String, required: false },
    access_tokens: { type: Number, required: false, default: 5000 },
    gpt_model: { type: String, required: false, default: 'gpt-3.5-turbo' },
    max_tokens: { type: Number, required: false, default: 2024 },
    temperature: { type: Number, required: false, default: 5 },
    date_of_birth: { type: {
            day: { type: Number, required: false },
            mounth: { type: Number, required: false },
            year: { type: Number, required: false }
        }, required: false },
    permissions: {
        type: {
            admin: { type: Boolean, required: false, default: false },
            translation_moderator: { type: Boolean, required: false, default: false },
            sentences_moderator: { type: Boolean, required: false, default: false },
            dictionary_moderator: { type: Boolean, required: false, default: false },
        },
        required: false
    },
    referral: { type: { users: { type: [mongoose_1.default.Schema.Types.ObjectId], _id: false, required: false } }, required: false },
    gender: { type: String || undefined, required: false },
    supported: { type: Number, required: true },
    reports: { type: [mongoose_1.default.Schema.Types.ObjectId], required: false },
    chats: { type: [mongoose_1.default.Schema.Types.ObjectId], required: false },
    translations: { type: [mongoose_1.default.Schema.Types.ObjectId], required: false, default: [] }, // добавлено поле "переводы"
    voted_translations: { type: [mongoose_1.default.Schema.Types.ObjectId], required: false, default: [] }, // добавлено поле "голосование за переводы"
    interface_language: { type: String, required: false },
    dictionary_section: { type: {
            suggested_words_on_dictionary: {
                suggested: { type: [mongoose_1.default.Schema.Types.ObjectId], required: false },
                accepted: { type: [mongoose_1.default.Schema.Types.ObjectId], required: false },
                diclined: { type: [mongoose_1.default.Schema.Types.ObjectId], required: false },
            }
        }, required: false },
    rating: { type: Number, required: true, default: 1 }, // добавлено поле "рейтинг",
    proposed_proposals: { type: [exports.proposedProposalSchema], required: false, _id: false },
}, {
    timestamps: true
});
const User = (0, mongoose_1.model)('User', userSchema);
exports.User = User;
const ProposedProposalModel = (0, mongoose_1.model)('Proposed_proposals', exports.proposedProposalSchema);
exports.ProposedProposalModel = ProposedProposalModel;
//# sourceMappingURL=IUser.js.map