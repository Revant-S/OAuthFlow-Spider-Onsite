import mongoose, { Document, Schema } from 'mongoose';

interface IAuthorizationCode extends Document {
    code: string;
    client_id: string;
    redirect_uri: string;
    scope: string;
    expires_at: Date;
}

const authorizationCodeSchema: Schema = new Schema({
    code: {
        type: String,
        required: true,
        unique: true,
    },
    client_id: {
        type: String,
        required: true,
    },
    redirect_uri: {
        type: String,
        required: true,
    },
    scope: {
        type: String,
        required: true,
    },
    expires_at: {
        type: Date,
        required: true,
    },
});


authorizationCodeSchema.index({ code: 1, expires_at: 1 });

const AuthorizationCode = mongoose.model<IAuthorizationCode>('AuthorizationCode', authorizationCodeSchema);

export default AuthorizationCode;
