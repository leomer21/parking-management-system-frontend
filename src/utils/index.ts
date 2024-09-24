import { format } from "date-fns";
import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";
import { PaidSessionData } from "../types";

let socket: Socket;

export const showToast = (msg: string, success: boolean = false) => {
  const fn = success ? toast.info : toast.error;
  fn(msg, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
  });
};

// Utility function to calculate Parking in hours
export const calculateParkingTimeInHours = (
  entryTime: string,
  exitTime: string
): string => {
  const entryDate = new Date(entryTime);
  const exitDate = new Date(exitTime);
  const periodTime = (exitDate.getTime() - entryDate.getTime()) / 3600000; // Convert milliseconds to hours
  return Math.floor(periodTime) + " hours";
};

export const calculateTotalAmount = (items: PaidSessionData[]) => {
  return items.reduce((sum, log) => sum + Number(log.Amount), 0);
};

// Convert timestamp to desired format using date-fns
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const formattedDateTime = format(date, "MM/dd/yyyy HH:mm:ss");
  return formattedDateTime;
};

export const calculatePaidEndTimeInHours = (
  startDate: string,
  paidAmount: number,
  hourlyRate: number | undefined
): string => {
  const date = new Date(startDate);
  const hours = Math.round((paidAmount - 0.5) * 0.93) / Number(hourlyRate);
  date.setHours(date.getHours() + hours);
  return format(date, "MM/dd/yyyy HH:mm:ss");
};

export const connectSocket = () => {
  console.log(import.meta.env.VITE_SOCKET_URL);

  socket = io(import.meta.env.VITE_SOCKET_URL, { transports: ["websocket"] });
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const sendMessage = (message: string) => {
  if (socket) socket.emit("send_message", message);
};

export const subscribeToMessages = (callback: () => void) => {
  if (!socket) return;

  socket.on("receive_message", callback);
};

export const unsubscribeFromMessages = () => {
  if (socket) socket.off("receive_message");
};
