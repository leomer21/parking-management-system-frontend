/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import MyCalendar from "../components/MyCalendar";
import axios from "axios";
import { Dropdown } from "primereact/dropdown";
import { LotType } from "../types";
import { defaultAllLot } from "../config";

const UnenforcableDates = () => {
  const [lots, setLots] = useState<LotType[]>([]);
  const [selectedLot, setSelectedLot] = useState<LotType>(defaultAllLot);

  const fetchLot = async () => {
    const { data } = await axios.get(`/lot`);
    setLots(data);
  };

  useEffect(() => {
    fetchLot();
  }, []);

  return (
    <>
      <Dropdown
        pt={{ root: { className: "border border-black" } }}
        value={selectedLot}
        onChange={(e) => setSelectedLot(e.value)}
        options={[defaultAllLot, ...lots]}
        optionLabel="siteCode"
        placeholder="Select a lot"
        className="w-full md:w-14rem"
      />
      {console.log(selectedLot)}
      {selectedLot && (
        <MyCalendar key={selectedLot.siteCode} lotId={selectedLot._id} />
      )}
    </>
  );
};
export default UnenforcableDates;
