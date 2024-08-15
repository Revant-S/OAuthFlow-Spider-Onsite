import mongoose, { Document, Schema } from 'mongoose';

interface IClient extends Document {
  redirect_url: string;
  app_name: string;
  client_id: string;
  client_secret: string;
}

const clientSchema: Schema = new Schema({
  redirect_url: {
    type: String,
    required: true,
    match: [/^https?:\/\/.*/, 'Invalid redirect URL'],
  },
  app_name: {
    type: String,
    required: true,
    trim: true,
  },
  client_id: {
    type: String,
    required: true,
    unique: true,
  },
  client_secret: {
    type: String,
    required: true,
  },
});




const Client = mongoose.model<IClient>('Client', clientSchema);

export default Client;
