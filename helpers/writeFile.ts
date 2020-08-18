import { Variant } from "../models/variant";
import fs from 'fs';

export default (data: Variant[], storeName: string) => {
    fs.writeFile(`${storeName}.json`, JSON.stringify(data), () => null);
}