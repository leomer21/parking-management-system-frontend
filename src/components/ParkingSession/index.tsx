import { useEffect, useRef, useState, ChangeEvent } from "react";
import { Dialog } from "primereact/dialog";
import { confirmDialog } from "primereact/confirmdialog";
import { Button } from "primereact/button";
import { TextInput, NumberInput } from "@tremor/react";
import { RiMoneyDollarCircleLine } from "@remixicon/react";

import HtmlTooltip from "../HtmlToolTip";
import axios from "axios";
import { useAuthorize } from "../../store/store";
import {
  LotType,
  LprSessionData,
  PaidSessionData,
  ParkerInfoType,
} from "../../types";
import {
  calculateParkingTimeInHours,
  calculateTotalAmount,
  formatTimestamp,
  showToast,
} from "../../utils";
import { TabView, TabPanel } from "primereact/tabview";

import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import TicketPreview from "../TicketPreview";
import { defaultPreviewData, defaultParkerInfo } from "../../config";

import LprSesstionTable from "./LprSesstionTable";
import PaidSessionTable from "./PaidSessionTable";
import NonViolationTable from "./NonViolationTable";
import ViolationTable from "./ViolationTable";
import ErrorTable from "./ErrorTable";
/* eslint-disable @typescript-eslint/no-explicit-any */

export default function ParkingSession({ lotId }: { lotId?: string }) {
  const { user } = useAuthorize();
  const [documentCountAmount, setDocumentCountAmount] = useState<number>();
  const [activeIndex, setActiveIndex] = useState<number>(
    user?.customClaims.admin ? 0 : 2
  );

  const [lots, setLots] = useState<LotType[]>([]);
  const [lprSessions, setLprSessions] = useState<LprSessionData[]>([]);
  const [paidSessions, setPaidSessions] = useState<PaidSessionData[]>([]);
  const [violations, setViolations] = useState<LprSessionData[]>([]);
  const [nonVolatoions, setNonViolations] = useState<LprSessionData[]>([]);
  const [errorSessions, setErrorSessions] = useState<LprSessionData[]>([]);

  const [previewData, setPreviewData] =
    useState<LprSessionData>(defaultPreviewData);
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);
  const [parkerInfo, setParkerInfo] =
    useState<ParkerInfoType>(defaultParkerInfo);

  const [fine, setFine] = useState<number>(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const accept = async () => {
    await axios.put(`/data/${previewData._id}`, {
      ticketCheck: true,
      fine: fine,
    });
    await fetchData();
  };

  const fetchLot = async () => {
    const { data } = await axios.get(`/lot`);
    setLots(data);
  };

  const fetchData = async () => {
    try {
      console.log("fetching now...");

      const { data: lprData } = await axios.get<LprSessionData[]>(
        `/data${lotId ? "/" + lotId : ""}`
      );

      setLprSessions(lprData.filter((item) => item.status === "OK"));
      setErrorSessions(lprData.filter((item) => item.status === "ERROR"));

      const { data: paidData } = await axios.get<PaidSessionData[]>(
        `/payment${lotId ? "/" + lotId : ""}`
      );

      setPaidSessions(paidData);

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

      timeoutRef.current = setTimeout(fetchData, 30000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleParkerInfoChange = (e: ChangeEvent<HTMLInputElement>) => {
    setParkerInfo({ ...parkerInfo, [e.target.name]: e.target.value });
  };

  const fetchImageFromBackend = async (
    imageUrl: string | undefined
  ): Promise<string> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_PUBLIC_URL}/${imageUrl}`
    );
    const imageBlob = await response.blob();
    return URL.createObjectURL(imageBlob);
  };

  const generatePDFWithImage = async (input: HTMLElement) => {
    try {
      const logoImg = await fetchImageFromBackend("img/logo.png");

      const logoElement = document.getElementById("logo") as HTMLImageElement;

      if (logoElement) {
        logoElement.src = logoImg;
      }

      const vehicle_1 = await fetchImageFromBackend(previewData.vehicle1);

      const vehicle_1_Element = document.getElementById(
        "vehicle_1"
      ) as HTMLImageElement;

      if (vehicle_1_Element) {
        vehicle_1_Element.src = vehicle_1;
      }
      if (previewData.vehicle2) {
        const vehicle_2 = await fetchImageFromBackend(previewData.vehicle2);

        const vehicle_2_Element = document.getElementById(
          "vehicle_2"
        ) as HTMLImageElement;

        if (vehicle_2_Element) {
          vehicle_2_Element.src = vehicle_2;
        }
      }

      const plate1 = await fetchImageFromBackend(previewData.plate1);

      const plate_1_Element = document.getElementById(
        "plate_1"
      ) as HTMLImageElement;

      if (plate_1_Element) {
        plate_1_Element.src = plate1;
      }

      if (previewData.plate2) {
        const plate2 = await fetchImageFromBackend(previewData.plate2);

        const plate_2_Element = document.getElementById(
          "plate_2"
        ) as HTMLImageElement;

        if (plate_2_Element) {
          plate_2_Element.src = plate2;
        }
      }

      // Initialize jsPDF
      const pdf = new jsPDF();

      // Use html2canvas to capture content, if needed
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Output the PDF. Here, opening it in a new browser tab
      window.open(pdf.output("bloburi"), "_blank");

      confirmDialog({
        message: "Did you download or print the pdf file?",
        header: "Confirmation",
        icon: "pi pi-exclamation-triangle",
        defaultFocus: "accept",
        accept,
      });
    } catch (error) {
      console.error("Error generating PDF: ", error);
    }
    setParkerInfo(defaultParkerInfo);
  };

  const handlePreview = async () => {
    if (!parkerInfo.name || !parkerInfo.address)
      showToast("Please input these information", false);
    else {
      setPreviewVisible(false);
      const input = document.getElementById("content-to-print");
      if (input) {
        await generatePDFWithImage(input);
      } else showToast("Error generating preview PDF", false);
    }
  };

  const handleVisible = (item: LprSessionData) => {
    setPreviewData(item);
    setFine(item.fine || item.lot.fine);
    setPreviewVisible(true);
  };

  const cameraBody = (product: LprSessionData) => (
    <HtmlTooltip
      title={
        <div>
          <p>Entrance : {product.camera1 || "No Enterance"}</p>
          <p>Exit : {product.camera2 || "Currently Parking..."}</p>
        </div>
      }
    >
      <span className={`underline text-blue-500 cursor-pointer`}>
        Camera URL
      </span>
    </HtmlTooltip>
  );

  const vehicleBody = (product: LprSessionData) => (
    <HtmlTooltip
      title={
        <div className="flex gap-4">
          <div className="w-[50%]">
            <span className="text-xl text-black">(Entrance)</span>
            {product.vehicle1 ? (
              <div className="flex flex-col gap-2 justify-center items-center">
                <img
                  src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                    product.vehicle1
                  }`}
                />
                <img
                  src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                    product.plate1
                  }`}
                />
              </div>
            ) : (
              <p>No Enterance</p>
            )}
          </div>
          <div className="w-[50%]">
            <span className="text-xl text-black">(Exit)</span>
            {product.vehicle2 ? (
              <div className="flex flex-col gap-2 justify-center items-center">
                <img
                  src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                    product.vehicle2
                  }`}
                />
                <img
                  src={`${import.meta.env.VITE_API_PUBLIC_URL}/${
                    product.plate2
                  }`}
                />
              </div>
            ) : (
              <p>Currently Parking...</p>
            )}
          </div>
        </div>
      }
    >
      <span className={`underline text-blue-500 cursor-pointer`}>
        (Entrance Exit)
      </span>
    </HtmlTooltip>
  );

  const reasonBody = (product: LprSessionData) => (
    <HtmlTooltip
      title={
        product.status === "NOTFULL" ? (
          <div>
            <p>
              Parking :{" "}
              {product.entryTime &&
                product.exitTime &&
                calculateParkingTimeInHours(
                  product.entryTime,
                  product.exitTime
                )}
            </p>
            <p>Hourly Rate : ${product.lot.hourlyRate}</p>
            <p>Only Paid : ${calculateTotalAmount(product.paymentLogs)}</p>
          </div>
        ) : (
          <div>There was no paying</div>
        )
      }
    >
      <span className={`underline text-blue-500 cursor-pointer`}>
        {product.status}
      </span>
    </HtmlTooltip>
  );

  useEffect(() => {
    fetchLot();
    fetchData();
    return () => clearTimeout(timeoutRef.current || undefined);
  }, []);

  useEffect(() => {
    activeIndex === 0 && setDocumentCountAmount(lprSessions.length);
    activeIndex === 1 && setDocumentCountAmount(paidSessions.length);
    activeIndex === 2 && setDocumentCountAmount(nonVolatoions.length);
    activeIndex === 3 && setDocumentCountAmount(violations.length);
    activeIndex === 4 && setDocumentCountAmount(errorSessions.length);
  }, [activeIndex]);

  return (
    <>
      <div className="p-2 bg-white rounded-lg w-min-[1300px] overflow-x-auto z-50">
        <div className="flex justify-between">
          <h1 className="font-bold p-2 text-lg">Sessions & Violations</h1>
          <div className="flex gap-2 items-center">
            <div className="p-2 rounded-md bg-blue-700 flex justify-center items-center w-fit cursor-pointer hover:opacity-80">
              <svg className="w-4 h-4 fill-white">
                <use href="#svg-refresh" />
              </svg>
            </div>
            <div className="px-3 py-1 border border-[#ccc] rounded-md text-sm">
              {documentCountAmount?.toString()} Records
            </div>
          </div>
        </div>
        <div className="flex max-md:flex-col justify-between items-center w-full">
          <TabView
            className="w-full"
            activeIndex={activeIndex}
            onTabChange={(e) => setActiveIndex(e.index)}
          >
            {user?.customClaims.admin && (
              <TabPanel header="LPR Sessions" className="lpr-session">
                <LprSesstionTable
                  lprSessions={lprSessions}
                  cameraBody={cameraBody}
                  vehicleBody={vehicleBody}
                  formatTimestamp={formatTimestamp}
                  calculateParkingTimeInHours={calculateParkingTimeInHours}
                />
              </TabPanel>
            )}
            {user?.customClaims.admin && (
              <TabPanel header="Paid Sessions" className="paid-session">
                <PaidSessionTable
                  paidSessions={paidSessions}
                  lots={lots}
                  formatTimestamp={formatTimestamp}
                />
              </TabPanel>
            )}
            <TabPanel header="Non-Violation" className="non-violation">
              <NonViolationTable
                nonVolatoions={nonVolatoions}
                formatTimestamp={formatTimestamp}
              />
            </TabPanel>

            <TabPanel header="Violations" className="violation">
              <ViolationTable
                violations={violations}
                reasonBody={reasonBody}
                handleVisible={handleVisible}
                formatTimestamp={formatTimestamp}
              />
            </TabPanel>

            {user?.customClaims.admin && (
              <TabPanel header="Error" className="lpr-error">
                <ErrorTable
                  errorSessions={errorSessions}
                  cameraBody={cameraBody}
                  vehicleBody={vehicleBody}
                  formatTimestamp={formatTimestamp}
                />
              </TabPanel>
            )}
          </TabView>
        </div>
        <Dialog
          header="Parker Information"
          visible={previewVisible}
          style={{ width: "50vw" }}
          onHide={() => {
            if (!previewVisible) return;
            setParkerInfo(defaultParkerInfo);
            setPreviewVisible(false);
          }}
          footer={<Button label="Preview" onClick={handlePreview} />}
        >
          <div className="flex p-2 flex-col gap-3">
            <TextInput
              type="text"
              placeholder="Name"
              name="name"
              value={parkerInfo.name}
              className="w-full"
              onChange={handleParkerInfoChange}
            />
            <TextInput
              type="text"
              placeholder="Address"
              name="address"
              value={parkerInfo.address}
              className="w-full"
              onChange={handleParkerInfoChange}
            />
            <NumberInput
              icon={RiMoneyDollarCircleLine}
              placeholder="Fine..."
              value={fine}
              min={0}
              onValueChange={(value) => setFine(value)}
            />
          </div>
        </Dialog>
      </div>
      <div className="h-0 overflow-hidden">
        <TicketPreview
          parkerInfo={parkerInfo}
          previewData={previewData}
          fine={fine}
        />
      </div>
    </>
  );
}
