import { Service } from "typedi";
import parser from '../helpers/parser';
import { ClientStore } from "../models/client.store";
import { Variant } from "../models/variant";
import Shopify from "shopify-api-node";

@Service()
export class StoreRepository {

    private clientStores: ClientStore[] = [];
    //private storeVariants: Shopify.IProductVariant[] = [];

    constructor() {
        this.clientStores = parser();
    }

    async getAll(): Promise<Variant[]> {
        const keyValueObj: { [SKU: string]: number } = {};
        const allStoresVariants: Variant[] = [];
        // create array of getOne() promises and pass it to child proccess? 
        for (let i = 0; i < this.clientStores.length; i++) {
            const storeVariants = await this.getOne(this.clientStores[i].name);
            for (let j = 0; j < storeVariants.length; j++) {
                const variant = storeVariants[j];
                if (variant.SKU in keyValueObj) {
                    keyValueObj[variant.SKU] += variant.amount;
                } else {
                    keyValueObj[variant.SKU] = variant.amount;
                }
            }
        }
        for (const key in keyValueObj) {
            allStoresVariants.push({
                SKU: key,
                amount: keyValueObj[key]
            });
        }
        return Promise.resolve(allStoresVariants);
    }


    async getOne(storeName: string): Promise<Variant[]> {
        const params = { limit: 1, fields: ["id", "variants"] };
        const variants = await this.fetchStoreInventory(storeName, [], params);
        return Promise.resolve(this.transformVariants(variants));
    }

    transformVariants(variants: Shopify.IProductVariant[]): Variant[] {
        return variants.map(variant => (
            {
                SKU: variant.sku,
                amount: variant.inventory_quantity
            }
        ));
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
        } else {
            return Promise.resolve(storeVariants);
        }
    }


}
