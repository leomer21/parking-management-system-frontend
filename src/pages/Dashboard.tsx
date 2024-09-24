import { useEffect, useState } from "react";
import ChartComponent from "../components/ChartComponent";
import DashboradTable from "../components/DashboradTable";
import { Dropdown } from "primereact/dropdown";
import { portalItems, defaultAllLot } from "../config";
import { LotType, PortalItemType, LprSessionData } from "../types";
import MonthlyPortal from "../components/MonthlyPortal";
import { useAuthorize } from "../store/store";

import axios from "axios";

const Dashboard = () => {
  const { user } = useAuthorize();

  const [lots, setLots] = useState<LotType[]>([]);

  const [lprSessions, setLprSessions] = useState<LprSessionData[]>([]);
  const [nonVolatoions, setNonViolations] = useState<LprSessionData[]>([]);
  const [violations, setViolations] = useState<LprSessionData[]>([]);

  const [selectedLot, setSelectedLot] = useState<LotType>(defaultAllLot);
  const [selectedItem, setSelectedItem] = useState<PortalItemType>(
    portalItems[0]
  );

  const fetchData = async () => {
    try {
      const lotUrl = "/lot";
      const dataUrl = `/data${selectedLot?._id ? `/${selectedLot._id}` : ""}`;

      const [lotsResponse, lprResponse] = await Promise.all([
        axios.get<LotType[]>(lotUrl),
        axios.get<LprSessionData[]>(dataUrl),
      ]);

      const lotData = lotsResponse.data;
      const lprData = lprResponse.data;

      setLots(lotData);
      setLprSessions(lprData);

      setNonViolations(
        lprData.filter(
          (item) =>
            item.status === "PAID" ||
            item.status === "FREE" ||
            item.status === "OWNER"
        )
      );

      setViolations(
        lprData.filter(
          (item) => item.status === "NOPAY" || item.status === "NOTFULL"
        )
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Failed to fetch data:", error.message);
      } else {
        console.error("Failed to fetch data:", error);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedLot]);

  return (
    <>
      <div className="flex flex-col lg:flex-row justify-between gap-4 w-full overflow-x-auto">
        {portalItems.map((item, index) => (
          <MonthlyPortal
            key={index}
            item={item}
            lprSessions={lprSessions}
            nonVolatoions={nonVolatoions}
            violations={violations}
            selectedItem={selectedItem}
            setSelectedItem={setSelectedItem}
          />
        ))}
      </div>

      <Dropdown
        pt={{ root: { className: "border border-black" } }}
        value={selectedLot}
        onChange={(e) => setSelectedLot(e.target.value)}
        options={[defaultAllLot, ...lots]}
        optionLabel="siteCode"
        placeholder="Select a lot"
        className="w-full md:w-14rem"
      />

      <ChartComponent violations={violations} selectedItem={selectedItem} />

      {user?.customClaims.admin && (
        <div className="w-full">
          <DashboradTable lprSessions={lprSessions} />
        </div>
      )}
    </>
  );
};
export default Dashboard;
