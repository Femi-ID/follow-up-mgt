import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Role } from "../enums/roles.enums";
import { IsEnum } from "class-validator";

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

    @Prop({required: true, type: String, enum: Role, default: Role.TEAM_MEMBER})
    @IsEnum(Role, { message: 'value must be one of the choices listed in the Role enum.' })
    role: Role;

    @Prop({ required: false, default: 'https://example.com/default-avatar.png'})
    avatarUrl: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
