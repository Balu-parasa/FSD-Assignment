import bcrypt from 'bcrypt';
import { InferSchemaType, Schema, model } from 'mongoose';
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    avatarUrl: String,
    refreshToken: { type: String, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        Reflect.deleteProperty(ret, 'passwordHash');
        Reflect.deleteProperty(ret, 'refreshToken');
        return ret;
      },
    },
  },
);
export type User = InferSchemaType<typeof userSchema>;
export const UserModel = model('User', userSchema);
export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const matchesPassword = (password: string, hash: string) => bcrypt.compare(password, hash);
