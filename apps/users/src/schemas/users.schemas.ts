import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true})
export class User {
    @Prop({ required: true})
    firstName: string;

    @Prop({ required: true})
    lastName: string;

    @Prop({ required: true, unique: true})
    email: string;

    @Prop({ required: true})
    password: string;

    @Prop({required: false})
    hashedRefreshToken: string;

    @Prop({ required: false, default: 'https://example.com/default-avatar.png'})
    avatarUrl: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
