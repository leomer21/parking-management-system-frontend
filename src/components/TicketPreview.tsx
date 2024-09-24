import { ParkerInfoType, LprSessionData } from "../types";
import { format, parseISO } from "date-fns";
import { QRCodeSVG } from "qrcode.react";

const TicketPreview = ({
  parkerInfo,
  previewData,
  fine,
}: {
  parkerInfo: ParkerInfoType;
  previewData: LprSessionData;
  fine: number;
}) => {
  return (
    <div id="content-to-print" className="px-16 py-8">
      <div className="flex justify-between items-center">
        <img width={100} id="logo" />

        <p
          className="text-4xl font-bold text-blue-800 tracking-normal uppercase relative"
          style={{
            fontFamily: "'Georgia', serif", // Using Georgia for a more traditional feel
            letterSpacing: "0.05em", // Adjust letter spacing
            textShadow: `
              1px 1px 3px rgba(0, 0, 0, 0.5), 
              2px 2px 5px rgba(0, 0, 0, 0.3)
            `, // Adjusted shadow for a subtle depth
          }}
        >
          City Park Monitoring
        </p>

        <div style={{ width: 150 }}></div>
      </div>

      <div className="flex justify-around px-8">
        <div className="flex flex-col justify-between py-8">
          <div>
            <p>City Park Monitoring</p>
            <p>2029 Coolidge Street</p>
            <p>Hollywood, FL 33020</p>
          </div>
          <div>
            <div className="flex justify-between items-end">
              <p>21704 1 AB 0.534</p>
              <QRCodeSVG value={"https://ppnotice.com/"} size={60} />
            </div>
            <p>*****AUTO**ALL FOR AADC 331</p>
            <p>{parkerInfo.name}</p>
            <p>{parkerInfo.address}</p>
          </div>
        </div>
        <div className="flex flex-col w-[60%]">
          <div className="flex pl-8 mt-8">
            <div className="flex flex-col w-[50%]">
              <p>PARKING CHARGE:</p>
              <p className="text-red-600">TOTAL AMOUNT DUE:</p>
            </div>
            <div className="flex flex-col">
              <p>${fine}</p>
              <p>${fine}</p>
            </div>
          </div>
          <div className="flex pl-8 mt-4">
            <div className="flex flex-col w-[50%]">
              <p className="text-red-600">NOTICE TYPE:</p>
              <p>NOTICE NUMBER:</p>
              <p>NOTICE DATE:</p>
              <p>PLATE:</p>
              <p>STATE:</p>
              <p>ENTRY TIME:</p>
              <p>EXIT TIME:</p>
            </div>
            <div className="flex flex-col">
              <p className="text-red-600">NON PAYMENT</p>
              <p>{previewData.noticeNumber}</p>
              <p>{format(Date.now(), "MM/dd/yyyy")}</p>
              <p>{previewData.plateNumber}</p>
              <p>FL</p>
              <p>
                {previewData.entryTime &&
                  format(parseISO(previewData.entryTime), "MM/dd/yyyy hh:mma")}
              </p>
              <p>
                {previewData.exitTime &&
                  format(parseISO(previewData.exitTime), "MM/dd/yyyy hh:mma")}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-16">
        <div className="flex text-4xl font-bold">
          {/* <span className="bg-red-600 text-white">PARKING CHARGE NOTICE</span> */}
          <span className="text-red-600">PARKING CHARGE NOTICE</span>
          <p className="text-red-600">&nbsp;- DO NOT IGNORE</p>
        </div>
        <div className="mt-4">
          <span>
            This vehicle parked at {previewData.lot.address} has an outstanding
            balance. In accordance with the terms and conditions of the Parking
            Contract clearyl displayed at the parking facility, the sum of
            $85.00 plus any applicable state sales tax and/or parking surcharge
            is due.
          </span>
          <span className="font-bold underline">
            If payment is made within 15 days of the Notice date, City Park
            Monitoring will reduce the amount you owe from $85.00 to $45.00 plus
            any applicable state sales tax and/or parking surcharge. If payment
            is not received within 15 days, you will be responsible for the full
            Parking Charge in the amount of $85.00 plus any applicable state
            sales tax and/or parking surcharge.
          </span>
          <p>
            FAILURE TO PAY THIS PARKING CHARGE NOTICE MAY RESULT IN THIS MATTER
            BEING REFERRED TO COLLECTIONS.
          </p>
          <p>
            To make your payment, please visit our secure website
            <span className="font-bold"> ppnotice.com</span>. You may also pay
            through our automated payment line (216) 849-3317, or by mailing a
            check to City Park Monitoring 2029 Coolidge Street, Hollywood, FL
            33020. You will be charged a $4.99 convenience fee for all online
            and telephone payments.
          </p>
        </div>
      </div>
      <div className="flex justify-center gap-10 w-full mt-16">
        <div className="flex flex-col justify-center items-center max-w-[45%]">
          <p className="font-bold">ENTRY</p>
          <img id="vehicle_1" className="mt-2" />
          <img id="plate_1" className="mt-2" />
        </div>
        {previewData.exitTime && (
          <div className="flex flex-col justify-center items-center max-w-[45%]">
            <p className="font-bold">EXIT</p>
            <img id="vehicle_2" className="mt-2" />
            <img id="plate_2" className="mt-2" />
          </div>
        )}
      </div>
      <div className="mt-8 font-bold">
        Important: This notice is an attempt to collect a debt, and any
        information obtained will be used for that purpose. You have the right
        to dispute the debt. Disputes can be made online at
        cityparkmanagement.com. If you have already sent payment, please
        disregard this notice.
      </div>
    </div>
  );
};

export default TicketPreview;
