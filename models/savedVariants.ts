import { Schema, model, Document } from 'mongoose';
import { Variant } from './variant';


export interface ISavedVariants extends Document {
    storeName: string;
    variants: Variant[];
}

const savedVariantsSchema: Schema = new Schema({
    storeName: {
        type: String,
        required: true
    },
    variants: {
        type: [],
        required: true
    }
});
export const SavedVariants = model<ISavedVariants>('SavedVariants', savedVariantsSchema);
