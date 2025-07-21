import type { InferTypeOf } from '@medusajs/framework/types';
import { model } from '@medusajs/framework/utils';
import VendorAdmin from './vendor-admin';

const Vendor = model.define('vendor', {
	id: model.id().primaryKey(),
	handle: model.text().unique(),
	name: model.text(),
	logo: model.text().nullable(),
	admins: model.hasMany(() => VendorAdmin),
});

export type Vendor = InferTypeOf<typeof Vendor>;

export default Vendor;
