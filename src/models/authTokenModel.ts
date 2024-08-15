import mongoose, { Document, Schema } from 'mongoose';

interface IToken extends Document {
    token: string;
    client_id: string;
    created_at: Date;
    expires_at: Date;
}

const tokenSchema: Schema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    client_id: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    expires_at: {
        type: Date,
        required: true
    }
});

// Create the Token model
const Token = mongoose.model<IToken>('Token', tokenSchema);

export default Token;
