export interface ISettings {
  key: string;
  value: any;
}

export interface IShippingChargeEdit {
  is_outside_dhaka: boolean;
  shipping_charge: number;
}

export interface ISettingsFilters {
  searchTerm?: string;
  key?: string;
  value?: any;
}
