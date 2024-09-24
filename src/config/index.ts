import {
  LotType,
  // PaidSessionData,
  PayingApp,
  LprSessionData,
  PortalItemType,
  DatePeriodType,
} from "../types";

const currentYear = new Date().getFullYear();

const generateDatesInMonth = (
  year: number,
  month: number
): DatePeriodType[] => {
  const dates: DatePeriodType[] = [];

  // Start at the first day of the month
  let currentDate = new Date(year, month, 1);

  // Loop until the month changes
  while (currentDate.getMonth() === month) {
    const startDate = new Date(currentDate);
    const endDate = new Date(year, month, currentDate.getDate() + 1);

    dates.push({
      name: `${startDate.getDate()}${getOrdinalSuffix(startDate.getDate())}`,
      period: [startDate, endDate],
    });

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};

// Helper function to get the ordinal suffix for a date
const getOrdinalSuffix = (date: number): string => {
  if (date > 3 && date < 21) return "th"; // For 11th to 20th
  switch (date % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

export const portalItems: PortalItemType[] = [
  {
    name: currentYear.toString(),
    period: [new Date(currentYear, 0, 1), new Date(currentYear, 11, 31)],
    items: Array.from({ length: 12 }, (_, monthIndex) => ({
      name: new Date(currentYear, monthIndex).toLocaleString("default", {
        month: "short",
      }),
      period: [
        new Date(currentYear, monthIndex, 1),
        new Date(currentYear, monthIndex + 1, 1),
      ] as [Date, Date],
    })),
  },
  ...Array.from({ length: 12 }, (_, monthIndex) => ({
    name: new Date(currentYear, monthIndex).toLocaleString("default", {
      month: "long",
    }),
    period: [
      new Date(currentYear, monthIndex, 1),
      new Date(currentYear, monthIndex + 1, 1),
    ] as [Date, Date],
    items: generateDatesInMonth(currentYear, monthIndex),
  })),
];

export const payingApps: PayingApp[] = [
  {
    name: "Flowbird",
    url: "https://weboffice.us.flowbird.io/cwo2/images/favicon.ico",
  },
  {
    name: "T2",
    url: "https://www.t2systems.com/wp-content/uploads/2020/10/cropped-favicon-32x32.png",
  },
  { name: "Citypark PayingApp", url: "https://i.ibb.co/HhCHXCY/fav-bg.jpg" },
];

export const defaultZone = {
  Description: [],
  Name: [],
};

export const defaultLotData: LotType = {
  _id: "",
  zone: "",
  token: "",
  cover: "",
  siteCode: "",
  url: "",
  address: "",
  hourlyRate: 0,
  payTime: 0,
  fine: 0,
  fee: 0,
  percentage: 0,
  pApps: [],
  owners: [],
};

export const defaultAllLot: LotType = {
  _id: "",
  zone: "",
  token: "",
  cover: "",
  siteCode: "ALL LOTS",
  url: "",
  address: "",
  hourlyRate: 0,
  payTime: 0,
  fine: 0,
  fee: 0,
  percentage: 0,
  owners: [],
  pApps: [],
};

// const defaultPaidData: PaidSessionData = {
//   _id: "",
//   Amount: 0,
//   Lot: defaultLotData,
//   Article: { Id: "", Name: "" },
//   Code: "",
//   ContainsTerminalOutOfCommunication: false,
//   DateChangedUtc: "",
//   DateCreatedUtc: "",
//   EndDateUtc: "",
//   IsExpired: false,
//   ParkingSpace: { Id: "", Location: "" },
//   ParkingZone: { Key: 0, Name: "", Number: 0 },
//   PostPayment: {
//     PostPaymentNetworkName: "",
//     PostPaymentTransactionID: 0,
//     PostPaymentTransactionStatusKey: 0,
//   },
//   PurchaseDateUtc: "",
//   StartDateUtc: "",
//   Tariff: { Id: "", Name: "" },
//   Terminal: {
//     Id: "",
//     Latitude: "",
//     Longitude: 0,
//     ParentNode: "",
//   },
//   TicketNumber: 0,
//   Zone: "",
// };

export const defaultPreviewData: LprSessionData = {
  _id: "",
  lot: defaultLotData,
  paymentLogs: [],
  violationLogs: [],
  camera1: "",
  camera2: "",
  plateNumber: "",
  plate1: "",
  plate2: "",
  vehicle1: "",
  vehicle2: "",
  entryTime: "",
  exitTime: "",
  status: "",
  fine: 0,
  noticeNumber: "",
  ticketCheck: false,
};

export const defaultParkerInfo = { name: "", address: "" };
