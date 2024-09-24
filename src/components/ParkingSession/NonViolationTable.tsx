import { FC, useState } from "react";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Column } from "primereact/column";
import { LprSessionData } from "../../types";
import { FilterMatchMode } from "primereact/api";
import { calculatePaidEndTimeInHours, calculateTotalAmount } from "../../utils";

interface Props {
  nonVolatoions: LprSessionData[];
  formatTimestamp: (arg1: string) => string;
}

const NonViolationTable: FC<Props> = ({ nonVolatoions, formatTimestamp }) => {
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
          placeholder="Filter by Lot, Plate, Entry, Exit, Paid"
          className="w-full px-4 py-2 mb-2 border-2"
        />
      </div>
    );
  };

  return (
    <DataTable
      header={renderHeader()}
      globalFilterFields={[
        "lot.siteCode",
        "plateNumber",
        "entryTime",
        "exitTime",
        // "payLog.PurchaseDateUtc",
        "status",
      ]}
      filters={filters}
      paginator
      rows={5}
      pageLinkSize={2}
      rowsPerPageOptions={[5, 10, 25, 50]}
      value={nonVolatoions}
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
        field="lot.siteCode"
        header="Lot"
        style={{ width: "13%" }}
      ></Column>
      <Column field="plateNumber" header="Plate"></Column>
      <Column
        field="entryTime"
        header="Entry"
        body={(item: LprSessionData) =>
          item.entryTime && formatTimestamp(item.entryTime)
        }
        style={{ width: "21%" }}
      ></Column>
      <Column
        field="exitTime"
        header="Exit"
        body={(item: LprSessionData) =>
          item.exitTime && formatTimestamp(item.exitTime)
        }
        style={{ width: "21%" }}
      ></Column>
      <Column
        header="Paid Start"
        body={(item: LprSessionData) =>
          item.paymentLogs.length
            ? formatTimestamp(item.paymentLogs[0]?.PurchaseDateUtc)
            : item.status
        }
        style={{ width: "21%" }}
      ></Column>
      <Column
        header="Paid End"
        body={(item: LprSessionData) =>
          item.paymentLogs.length
            ? calculatePaidEndTimeInHours(
                item.paymentLogs[0]?.PurchaseDateUtc,
                calculateTotalAmount(item.paymentLogs),
                item.lot.hourlyRate
              )
            : item.status
        }
        style={{ width: "21%" }}
      ></Column>
      <Column
        header="Amount"
        body={(item: LprSessionData) =>
          item.paymentLogs.length
            ? `$${calculateTotalAmount(item.paymentLogs)}`
            : item.status
        }
        style={{ width: "13%" }}
      ></Column>
    </DataTable>
  );
};

export default NonViolationTable;
