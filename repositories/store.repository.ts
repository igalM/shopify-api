import { Service } from "typedi";
import * as FilesHelper from '../helpers/filesHelper';
import { ClientStore } from "../models/client.store";
import { Variant } from "../models/variant";
import Shopify from "shopify-api-node";
import Bluebird from 'bluebird';

@Service()
export class StoreRepository {

    private clientStores: ClientStore[] = [];

    constructor() {
        this.clientStores = FilesHelper.parseEnvFile();
    }

    async getAllStores(): Promise<Variant[]> {
        const savedVariants: Variant[] = [];
        const result: Variant[] = [];
        const promises = [];
        for (let i = 0; i < this.clientStores.length; i++) {
            const variants = FilesHelper.readJSONFile(this.clientStores[i].name);
            if (variants) {
                savedVariants.push(...variants);
            }
            else {
                promises.push(this.getOneStore(this.clientStores[i].name));
            }
        }
        const allStoresVariants = await Bluebird.Promise.map(promises, (p) => p, { concurrency: 5 });
        const keyValueObj: { [SKU: string]: number } = {};
        const flattenedAllVariants: Variant[] = [].concat(...allStoresVariants);
        if (savedVariants.length > 0) {
            flattenedAllVariants.push(...savedVariants);
        }
        for (const variant of flattenedAllVariants) {
            if (variant.SKU in keyValueObj) {
                keyValueObj[variant.SKU] += variant.amount;
            }
            else {
                keyValueObj[variant.SKU] = variant.amount;
            }
        }
        for (const key in keyValueObj) {
            result.push({ SKU: key, amount: keyValueObj[key] });
        }
        return Promise.resolve(result);
    }


    async getOneStore(storeName: string): Promise<Variant[]> {
        const params = { limit: 1, fields: ["id", "variants"] };
        const variants = await this.fetchStoreInventory(storeName, [], params);
        const transformedVariants = this.transformVariants(variants);
        FilesHelper.writeJSONFile(transformedVariants, storeName);
        return Promise.resolve(transformedVariants);
    }

    async fetchStoreInventory(storeName: string, storeVariants: Shopify.IProductVariant[], params: {}): Promise<Shopify.IProductVariant[]> {
        const store = this.clientStores.find(store => store.name === storeName);
        const shopify = new Shopify({
            shopName: store.name,
            apiKey: store.apiKey,
            password: store.password,
            apiVersion: '2020-07'
        });
        const inventory: any = await shopify.product.list(params);
        const products: { [id: string]: Shopify.IProductVariant[] } = {};
        for (const product of inventory) {
            products[product.id] = product.variants;
        }
        for (const productId in products) {
            storeVariants.push(...products[productId]);
        }
        if (inventory.nextPageParameters) {
            return this.fetchStoreInventory(storeName, storeVariants, inventory.nextPageParameters);
        }
        else {
            return Promise.resolve(storeVariants);
        }
    }


    transformVariants(variants: Shopify.IProductVariant[]): Variant[] {
        return variants.map(variant => ({ SKU: variant.sku, amount: variant.inventory_quantity }));
    }

}
