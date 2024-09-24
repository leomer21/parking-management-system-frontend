/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { BarChart, Card } from "@tremor/react";
import { Button } from "primereact/button";

import { PortalItemType, LprSessionData } from "../types";
import { useAuthorize } from "../store/store";
import { calculateTotalAmount } from "../utils";

interface ChatDataType {
  Commissions: string;
  Revenue: number;
}

const ChartComponent = ({
  violations,
  selectedItem,
}: {
  violations: LprSessionData[];
  selectedItem: PortalItemType;
}) => {
  const { user } = useAuthorize();

  const [graphFlag, setGraphFlag] = useState<string>("Total");
  const [totalItems, setTotalItems] = useState<ChatDataType[]>([]);
  const [paidItems, setPaidItems] = useState<ChatDataType[]>([]);
  const [profitItems, setProfitItems] = useState<ChatDataType[]>([]);

  const dataFormatter = (number: number) =>
    Intl.NumberFormat("us").format(number).toString();

  const makeChartDataForTotal = () => {
    return selectedItem.items.map((item) => {
      const revenue = violations.reduce(
        (totalRevenue: number, vs: LprSessionData) => {
          const entry = new Date(vs.entryTime || "");
          if (item.period[0] <= entry && entry <= item.period[1]) {
            return totalRevenue + calculateTotalAmount(vs.paymentLogs);
          }
          return totalRevenue;
        },
        0
      );

      return {
        Commissions: item.name,
        Revenue: revenue,
      };
    });
  };

  const makeChartDataForPaid = () => {
    return selectedItem.items.map((item) => {
      const revenue = violations.reduce(
        (totalRevenue: number, vs: LprSessionData) => {
          const entry = new Date(vs.entryTime || "");
          if (item.period[0] <= entry && entry <= item.period[1]) {
            return (
              totalRevenue +
              (calculateTotalAmount(vs.paymentLogs) *
                (100 - vs.lot.percentage)) /
                100
            );
          }
          return totalRevenue;
        },
        0
      );

      return {
        Commissions: item.name,
        Revenue: revenue,
      };
    });
  };

  const makeChartDataForProfits = () => {
    return selectedItem.items.map((item) => {
      const revenue = violations.reduce(
        (totalRevenue: number, vs: LprSessionData) => {
          const entry = new Date(vs.entryTime || "");
          if (item.period[0] <= entry && entry <= item.period[1]) {
            return (
              totalRevenue +
              (calculateTotalAmount(vs.paymentLogs) * vs.lot.percentage) / 100
            );
          }
          return totalRevenue;
        },
        0
      );

      return {
        Commissions: item.name,
        Revenue: revenue,
      };
    });
  };

  useEffect(() => {
    setTotalItems(makeChartDataForTotal());
    setPaidItems(makeChartDataForPaid());
    setProfitItems(makeChartDataForProfits());
  }, [violations, selectedItem]);

  return (
    <div className="flex flex-col gap-8">
      {user?.customClaims.admin && (
        <div className="flex justify-center gap-8">
          <Button
            label="Total Commission"
            onClick={() => setGraphFlag("Total")}
            raised
          />
          <Button
            label="Paid Out"
            severity="success"
            className="p-success"
            onClick={() => setGraphFlag("Paid")}
            raised
          />
          <Button
            label="Profits"
            severity="info"
            className="p-info"
            onClick={() => setGraphFlag("Profits")}
            raised
          />
        </div>
      )}

      {user?.customClaims.admin && graphFlag == "Total" && (
        <div className="flex flex-col gap-4">
          <Card className="w-full p-4 pt-0 border-l-4 border-yellow-500">
            <div className="flex flex-col items-center justify-between">
              <div className="flex gap-2 justify-center items-center mt-2">
                <h3 className="font-medium text-tremor-content-strong/50 dark:text-dark-tremor-content-strong">
                  Total Commission
                </h3>
                <span className="text-xl text-green-400">
                  ( {violations.length} )
                </span>
              </div>
              <BarChart
                data={totalItems}
                index="Commissions"
                categories={["Revenue"]}
                colors={["blue"]}
                valueFormatter={dataFormatter}
              />
            </div>
          </Card>
        </div>
      )}

      {(!user?.customClaims.admin || graphFlag == "Paid") && (
        <div className="flex flex-col gap-4">
          <Card className="w-full p-4 pt-0 border-l-4 border-yellow-500">
            <div className="flex flex-col items-center justify-between">
              <div className="flex gap-2 justify-center items-center mt-2">
                <h3 className="font-medium text-tremor-content-strong/50 dark:text-dark-tremor-content-strong">
                  {user?.customClaims.admin ? "Paid Out" : "Profits"}
                </h3>
                <span className="text-xl text-green-400">
                  ( {violations.length} )
                </span>
              </div>
              <BarChart
                data={paidItems}
                index="Commissions"
                categories={["Revenue"]}
                colors={["blue"]}
                valueFormatter={dataFormatter}
              />
            </div>
          </Card>
        </div>
      )}

      {user?.customClaims.admin && graphFlag == "Profits" && (
        <div className="flex flex-col gap-4">
          <Card className="w-full p-4 pt-0 border-l-4 border-yellow-500">
            <div className="flex flex-col items-center justify-between">
              <div className="flex gap-2 justify-center items-center mt-2">
                <h3 className="font-medium text-tremor-content-strong/50 dark:text-dark-tremor-content-strong">
                  Profits
                </h3>
                <span className="text-xl text-green-400">
                  ( {violations.length} )
                </span>
              </div>
              <BarChart
                data={profitItems}
                index="Commissions"
                categories={["Revenue"]}
                colors={["blue"]}
                valueFormatter={dataFormatter}
              />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ChartComponent;
