export type Line = {
  iccid: string;
  productId: string;
  deactivation_date: string;
  expired_at: string;
  allowed_usage_kb: number;
  remaining_usage_kb: number;
  remaining_days: number;
  auto_refill_turned_on: boolean;
  auto_refill_amount_mb: number;
  auto_refill_price: number;
  auto_refill_currency: string;
  status: number;
  bundle: string;
  notes: string;
  dataBundles?: DataBundle[];
};

type Pagination = {
  from: number;
  to: number;
  lastPage: number;
  perPage: number;
  total: number;
  currentPage: number;
};

export enum BundleStatus {
  NON_ACTIVE = 0,
  ACTIVE = 1,
  FINISHED = 2,
  EXPIRED = 3,
}

export type Bundle = {
  id: number;
  typeId: number;
  name: string;
  description: string;
  coverage: [string];
  refills: [Refill];
};

type DataBundle = {
  id: number;
  status: BundleStatus;
  allowedUsageKb: number;
  activeKb: number;
  remainingUsageKb: number;
  validity: number;
  assignedAt: string;
  activatedAt?: string;
  terminatedAt?: string;
  expireAt: string;
};

type FilterData = {
  statusId: [string];
  autoRefillsStatusId: [string];
};

export type CreateLine = {
  iccid: string;
  qr_code: string;
  lpa_code: string;
};

export type LineDetails = Omit<Line, 'expiredAt'> & {
  msisdn: string;
  autoRefillTurnedOn: number;
  autoRefillAmountMb: string;
  autoRefillPrice: number;
  autoRefillCurrency: string;
  autoRefillList: [Refill];
};

export type Refill = {
  title: string;
  amount_mb: number;
  amount_days: number;
  price_usd: number;
  price_eur: number;
};

type Transaction = {
  createdAt: string;
  status: string;
  amount: string;
  currency: string;
  type: string;
  invoiceHash: string;
  refillAmountMb: number;
  reason: string;
  productId: string;
};

type Transactions = {
  transaction: {
    data: [Transaction];
  };
};

export type KeepGoResponseParams = {
  ack: string;
  sim_cards?: [Line];
  filters?: [FilterData];
  sim_card?: LineDetails[] | Line | CreateLine;
  available_refills?: [Refill];
  transactions?: Transactions;
  products_types?: [string];
  bundles?: Bundle[];
  bundle: Bundle[];
  network_providers?: [string];
  countries?: { [key: string]: string };
  regions?: [string];
  data: [string];
};

export type KeepGoResponse = Partial<Pagination> & KeepGoResponseParams;
