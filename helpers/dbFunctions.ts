import mongoose from 'mongoose';
import { Variant } from '../models/variant';
import { SavedVariants } from '../models/savedVariants';

export const connectToDatabase = () => {
    const connection: string = "mongodb://mongo:27017/cymbio";
    return mongoose.connect(connection);
};

export const saveVariants = (storeName: string, variants: Variant[]) => {
    SavedVariants.create({ storeName: storeName, variants: variants });
}

export const getVariants = async (storeName: string) => {
    const data = await SavedVariants.findOne({ storeName });
    return data ? data.variants : null;
}