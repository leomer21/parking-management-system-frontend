export type DataItem = {
  _id: string;
  lot: string;
  camera: string;
  plateNumber: string;
  plate: string;
  vehicle: string;
  direction: string;
  match: string;
  createdAt: string;
};

export type PermitType = {
  _id?: string;
  name: string;
  reason: string;
  plate: string;
  lot?: LotType;
};

export type LotType = {
  _id: string;
  zone: string;
  token: string;
  cover: string;
  siteCode: string;
  url: string;
  address: string;
  hourlyRate: number;
  payTime: number;
  fine: number;
  fee: number;
  percentage: number;
  owners: string[];
  pApps: string[];
};

export type UserType = {
  uid: string;
  email: string;
  emailVerified: boolean;
  disabled: boolean;
  displayName?: string;
  photoURL?: string;
  customClaims?: {
    admin?: boolean;
  };
  metadata: {
    lastSignInTime: string;
    creationTime: string;
    lastRefreshTime: string;
  };
  passwordHash?: string;
  passwordSalt?: string;
};

export type ZoneType = {
  Description: string[];
  Name: string[];
};

export interface PayingApp {
  name: string;
  url: string;
}

export interface LprSessionData {
  _id: string;
  lot: LotType;
  paymentLogs: PaidSessionData[];
  violationLogs: ViolationLogData[];
  camera1: string;
  camera2: string;
  plateNumber: string;
  plate1?: string;
  plate2?: string;
  vehicle1?: string;
  vehicle2?: string;
  entryTime?: string;
  exitTime?: string;
  status: string;
  fine: number;
  noticeNumber?: string;
  ticketCheck: boolean;
}

export interface PaidSessionData {
  _id: string;
  Amount: number;
  Lot?: LotType;
  Article: { Id: string; Name: string };
  Code: string;
  ContainsTerminalOutOfCommunication: boolean;
  DateChangedUtc: string;
  DateCreatedUtc: string;
  EndDateUtc: string;
  IsExpired: boolean;
  ParkingSpace: { Id: string; Location: string };
  ParkingZone: { Key: number; Name: string; Number: number };
  PostPayment: {
    PostPaymentNetworkName: string;
    PostPaymentTransactionID: number;
    PostPaymentTransactionStatusKey: number;
  };
  PurchaseDateUtc: string;
  StartDateUtc: string;
  Tariff: { Id: string; Name: string };
  Terminal: {
    Id: string;
    Latitude: string;
    Longitude: number;
    ParentNode: string;
  };
  TicketNumber: number;
  Zone: string;
}

export interface ViolationLogData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  payLog: PaidSessionData;
  lprSession: LprSessionData;
}

export interface LogType {
  createDate: string;
  status: string;
  amount: number;
}

export type MessageType = {
  sender: string;
  content: string;
};

export type MessageContent = {
  id: string;
  content: string;
  createdAt: string;
};

export type InboxType = {
  sender: string;
  contents: MessageContent[];
  count: number;
};

export interface DatePeriodType {
  name: string;
  period: [Date, Date];
}

export interface PortalItemType {
  name: string;
  period: [Date, Date];
  items: DatePeriodType[];
}

export interface MonthlyPortalType {
  item: PortalItemType;
  selectedItem: PortalItemType;
  setSelectedItem: (item: PortalItemType) => void; // Adjusting the type for correct usage
  lprSessions: LprSessionData[];
  nonVolatoions: LprSessionData[];
  violations: LprSessionData[];
}

export interface ParkerInfoType {
  name: string;
  address: string;
}
