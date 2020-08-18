import * as fs from 'fs';
import * as path from 'path';
import { ClientStore } from '../models/client.store';

export default () => {
    const clientStores: ClientStore[] = [];
    let clientStore: ClientStore = new ClientStore();
    let number: number = 1;
    const envsArray: string[] = parseEnvFile();
    envsArray.forEach((item: string) => {
        const keyValArr = item.split('=');
        const key: string = keyValArr[0];
        const property: string = key.slice(0, key.length - 2);
        const currentStoreNumber: number = parseInt(key.charAt(key.length - 1));
        if (currentStoreNumber !== number) {
            number = currentStoreNumber;
            clientStores.push(clientStore);
            clientStore = new ClientStore();
        }
        clientStore = addPropertyToObject(clientStore, property, keyValArr[1]);
    });
    clientStores.push(clientStore);
    return clientStores;
}

const addPropertyToObject = (clientStore: ClientStore, property: string, value: string): ClientStore => {
    switch (property) {
        case 'STORE_NAME': return { ...clientStore, name: value }
        case 'STORE_API_KEY': return { ...clientStore, apiKey: value }
        case 'STORE_PASS': return { ...clientStore, password: value }
        default: return clientStore;
    }
}


const parseEnvFile = () => {
    const envFilePath = path.resolve(process.cwd(), '.env')
    const encoding = 'utf8'
    const newLine = '\n';
    const parsedString = fs.readFileSync(envFilePath, { encoding });
    return parsedString.split(newLine);
}
