import {JsonController, Get, Param} from "routing-controllers";
import {StoreRepository} from "../repositories/store.repository";
import {Variant} from "../models/variant";

@JsonController('')
export class StoreController {
    constructor(
        private readonly storeRepository: StoreRepository,
    ) {
    }

    @Get('/inventory')
    async getAllStoresInventory(): Promise<Variant[]> {
        return await this.storeRepository.getAll();
    }

    @Get('/:storeName/inventory')
    async getSingleStoreInventory(@Param('storeName') storeName: string): Promise<Variant[]> {
        return await this.storeRepository.getOne(storeName);
    }

}
