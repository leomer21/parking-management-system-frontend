import { FC, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  Divider,
  ListItemText,
  Typography,
} from "@mui/material";
import { useSideBarOpen, userPrimitiveType } from "../store/store";
import { Textarea, Button } from "@tremor/react";
import { Toast } from "primereact/toast";

import {
  showToast,
  connectSocket,
  disconnectSocket,
  subscribeToMessages,
  unsubscribeFromMessages,
} from "../utils";

import axios from "axios";
import { MessageType } from "../types";

type Props = {
  user?: userPrimitiveType | null;
};

const Header: FC<Props> = ({ user }) => {
  const toast = useRef<Toast>(null);

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [message, setMessage] = useState<string>("");
  const [mBadge, setMBadge] = useState<number>(0);
  const [aBadge, setABadge] = useState<number>(0);
  const [messages, setMessages] = useState<MessageType[]>([]);
  //   const [alarms, setAlarms] = useState([
  //     {
  //       sender: "test 1",
  //       content: "This is a test alarm",
  //     },
  //   ]);
  const alarms = [
    {
      sender: "test 1",
      content: "This is a test alarm",
    },
  ];
  const [lestItems, setListItems] = useState<any>([]);

  const handleMessageView = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setListItems(messages);
    setMBadge(0);
  };

  const handleAlarmView = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setListItems(alarms);
    setABadge(0);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const submitMessage = async () => {
    const res = await axios.post("/message", { message, sender: user?.email });
    if (res.status === 201)
      showToast("Your message was sent to server successfully", true);
    else showToast("Something went wrong", false);
    setMessage("");
    setAnchorEl(null);
  };

  const fetchMessages = async () => {
    const { data } = await axios.get<MessageType[]>("/message");

    setMessages(data);
  };

  useEffect(() => {
    user && connectSocket();

    user?.customClaims.admin && fetchMessages();

    user?.customClaims.admin &&
      subscribeToMessages(async () => {
        await fetchMessages();

        setMBadge((preValue) => preValue + 1);
      });

    return () => {
      unsubscribeFromMessages();
      disconnectSocket();
    };
  }, []);

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const { setSideBarOpen } = useSideBarOpen();
  return (
    <div className="w-full h-[90px] py-2 flex justify-between items-center bg-[#22cbad] shadow-[0_0_2px_2px_#8888] absolute top-0">
      <div className="flex justify-between items-center">
        <div className="flex flex-row-reverse justify-end md:flex-row md:justify-between gap-4 items-center md:w-[300px] px-6">
          <Link to="/">
            <div>
              <img className="min-w-20 w-28" src="./logo.png" />
            </div>
          </Link>
          <button
            onClick={() => setSideBarOpen((v) => !v)}
            className="hover:opacity-80 transition-all ease-in-out"
          >
            <svg className="w-6 h-6 text-white">
              <use href="#svg-three-mobile" />
            </svg>
          </button>
        </div>
        <div className="max-sm:hidden grow flex items-center pl-4">
          <div className="relative">
            <p className="text-white text-4xl font-bold italic drop-shadow-lg">
              City Park Monitoring
            </p>
          </div>
        </div>
      </div>
      {user && (
        <div className="flex gap-6 items-center px-4 cursor-pointer">
          <IconButton aria-label="cart" onClick={handleMessageView}>
            <Badge
              badgeContent={user?.customClaims.admin ? mBadge : 0}
              color="info"
            >
              <svg className="w-6 h-6 fill-white max-sm:hidden">
                <use href="#svg-email" />
              </svg>
            </Badge>
          </IconButton>

          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            {user?.customClaims.admin ? (
              <List>
                {lestItems.length ? (
                  lestItems.map((item: any, index: number) => (
                    <div key={index}>
                      <ListItem className="max-w-80">
                        <ListItemText
                          primary={item.content}
                          secondary={item.sender}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </div>
                  ))
                ) : (
                  <ListItem className="max-w-80">
                    {"There is no messages"}
                  </ListItem>
                )}
              </List>
            ) : (
              <div className="p-5">
                <Typography sx={{ p: 2 }}>How can we help you?</Typography>
                <Textarea
                  rows={5}
                  cols={30}
                  maxLength={60}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What do you need?"
                />
                <Button
                  // icon={RiCheckFill}
                  onClick={submitMessage}
                  color="green"
                  disabled={!message}
                  className="mt-5 w-full bg-[#22cbad] hover:bg-[#30b39b]"
                >
                  Submit
                </Button>
              </div>
            )}
          </Popover>

          {user?.customClaims.admin && (
            <IconButton aria-label="cart" onClick={handleAlarmView}>
              <Badge badgeContent={aBadge} color="info">
                <svg className="w-6 h-6 fill-white max-sm:hidden">
                  <use href="#svg-ring" />
                </svg>
              </Badge>
            </IconButton>
          )}
          <img
            className="rounded-full w-10 h-10 min-w-10 min-h-10 float-right"
            src={
              user?.photoURL ||
              `${import.meta.env.VITE_API_PUBLIC_URL}/user.png`
            }
          />
        </div>
      )}
      <Toast ref={toast} />
    </div>
  );
};
export default Header;
