import { FC, useState } from "react";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Column } from "primereact/column";
import { LotType, PaidSessionData } from "../../types";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { calculatePaidEndTimeInHours } from "../../utils";

interface Props {
  paidSessions: PaidSessionData[];
  lots: LotType[];
  formatTimestamp: (arg1: string) => string;
}

const PaidSessionTable: FC<Props> = ({
  paidSessions,
  lots,
  formatTimestamp,
}) => {
  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };

    _filters.global = { ..._filters.global, value };

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="border-b-2">
        <InputText
          value={globalFilterValue}
          onChange={onGlobalFilterChange}
          placeholder="Filter by Plate, Lot, Paid, or Amount"
          className="w-full px-4 py-2 mb-2 border-2"
        />
      </div>
    );
  };

  const getLotSiteCode = (item: PaidSessionData) => {
    const lot = lots.find((lot) => lot.zone === item.Zone);
    return item.Lot?.siteCode || lot?.siteCode || "Unknown";
  };

  const getPaidAmount = (item: PaidSessionData) => {
    return `$${item.Amount}`;
    // return `$${Math.round((item.Amount - 0.5) * 0.93)}`;
  };

  return (
    <DataTable
      header={renderHeader()}
      globalFilterFields={[
        "Code",
        "Lot.siteCode",
        "Zone",
        "PurchaseDateUtc",
        "Amount",
      ]}
      filters={filters}
      paginator
      rows={5}
      pageLinkSize={2}
      rowsPerPageOptions={[5, 10, 25, 50]}
      value={paidSessions}
      tableStyle={{ minWidth: "50rem" }}
      pt={{
        thead: { className: "text-[14px]" },
        paginator: {
          pageButton: ({ context }: { context: any }) => ({
            className: context.active
              ? "bg-blue-500 text-white text-[12px]"
              : undefined,
          }),
        },
      }}
    >
      <Column
        header="Lot"
        body={getLotSiteCode}
        headerClassName="w-[13%]"
      ></Column>
      <Column field="Code" header="Plate"></Column>
      <Column
        header="Paid Start"
        body={(item: PaidSessionData) => formatTimestamp(item.PurchaseDateUtc)}
        style={{ width: "24%" }}
      ></Column>
      <Column
        header="Paid End"
        body={(item: PaidSessionData) =>
          calculatePaidEndTimeInHours(
            item.PurchaseDateUtc,
            item.Amount,
            item.Lot?.hourlyRate
          )
        }
        style={{ width: "24%" }}
      ></Column>
      <Column
        header="Amount"
        body={getPaidAmount}
        style={{ width: "10%" }}
      ></Column>
    </DataTable>
  );
};

export default PaidSessionTable;
