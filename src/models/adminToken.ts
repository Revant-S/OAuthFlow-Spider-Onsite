import { Schema, Document, model } from "mongoose";

interface AdminToken extends Document {
    userEmail: string;
    adminToken: string;
    createdAt: Date;
    expiresAt: Date;
}

const adminTokenSchema: Schema = new Schema<AdminToken>({
    userEmail: {
        type: String,
        required: true,
        unique : true
    },
    adminToken: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,  
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});

adminTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });



const AdminToken = model<AdminToken>("AdminToken", adminTokenSchema);

export default AdminToken;
