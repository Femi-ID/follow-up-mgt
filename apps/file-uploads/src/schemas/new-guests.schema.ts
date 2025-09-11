import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IsEnum } from "class-validator";
import { Gender } from "../enums/gender.enums";
import { AgeGroup } from "../enums/age-group.enum";
import { ResponseStatus } from "../enums/responseStatus.enum";

@Schema({ timestamps: true})
export class NewGuest {
    @Prop({ required: true})
    name: string;

    @Prop({ required: false, unique: true, sparse: true })
    // A sparse index tells MongoDB to only enforce uniqueness when the field exists.
    email: string;

    @Prop({ required: true })
    address: string;

    @Prop({ required: true })
    phoneNumber: string;

    @Prop({ required: false})
    member: boolean

    @Prop({ required: true, type: String, enum: Gender })
    @IsEnum(Gender, { message: 'value must be one of the choices listed in the Gender enum.'})
    gender: Gender;

    @Prop({ required: true, type: String, enum: AgeGroup })
    @IsEnum(AgeGroup, { message: 'value must be one of the choices listed in the AgeGroup enum.'})
    ageGroup: AgeGroup;

    @Prop({ required: true, type: String })
    @IsEnum(ResponseStatus, { message: 'value must be one of the choices listed in the ResponseStatus enum.'})
    response: ResponseStatus;

    @Prop({ required: true })
    fileName: string

    @Prop({ required: true})
    sheetName: string
}

export const NewGuestSchema = SchemaFactory.createForClass(NewGuest);
