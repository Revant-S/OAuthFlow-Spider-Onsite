import mongoose, { Document, Schema } from 'mongoose';


interface IUser extends Document {
    userEmail: string;
    password: string;
    bank_secret: string;
}

const userSchema: Schema = new Schema({
    userEmail: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
    },
    password: {
        type: String,
        required: true,
    },
    bank_secret: {
        type: String,
        required: true,
    }
});




const User = mongoose.model<IUser>('User', userSchema);

export default User;
