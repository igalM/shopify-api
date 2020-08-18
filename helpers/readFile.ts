import * as fs from 'fs';
import * as path from 'path';
import { Variant } from '../models/variant';

export default (storeName: string): null | Variant[] => {
    const filePath = path.resolve(process.cwd(), `${storeName}.json`);
    if (!fs.existsSync(filePath)) return null;
    const rawData = fs.readFileSync(filePath);
    return JSON.parse(rawData.toString());
}