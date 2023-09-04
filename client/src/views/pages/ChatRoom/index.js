import React, { useState, useEffect, useRef } from "react";
import { Stack, Grid, Box, TextField, Button, Typography } from "@mui/material";
import io from "socket.io-client";
import { format } from "date-fns";
import chat from '../../../../src/chat.png';
import UsernameDialog from "./UsernameDialog";
import { lightBlue } from "@mui/material/colors";

const socket = io("http://localhost:5000");

function ChatApp() {
  const scrollRef = useRef();

  const [username, setUsername] = useState(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    // Scroll to bottom if new message received
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Setup Socket Events
    const setupEvents = () => {
      socket.on("receive_message", (e) => {
        const data = JSON.parse(e);

        const lastMessage = chatMessages.length
          ? chatMessages[chatMessages.length - 1]
          : null;

        if (
          !(
            lastMessage?.message === data.message &&
            lastMessage?.createdDate === data.createdDate
          )
        ) {
          chatMessages.push(data);
          setChatMessages([...chatMessages]);
        }
      });
    };

    setupEvents();
  }, [chatMessages]);

  // Send Messge
  const sendMessage = (e) => {
    e.preventDefault();

    const data = { username, message, createdDate: new Date() };

    socket.emit("send_message", JSON.stringify(data));

    setMessage("");
  };

  // Welcome User message
  const welcomeMessageView = () => (
    <Grid container item padding={3} 
    sx={(theme)=>({
      
      border:'1px solid black',
      backgroundColor:'#2c7DA0',
      color:'white'
    })}
    ><img src={chat} width='200px' height='50px'></img>
      
      <Grid item
      sx={(theme)=>({
      
        fontSize:'22px',
        color:'white',
        marginLeft:'40px',
        marginTop:'12px'
        
      })}
      >
        
        Welcome {username}</Grid>
      
    </Grid>
    
  );

  // Messages View
  const messagesView = () => (
    <Stack
      ref={scrollRef}
      direction="column"
      spacing={3}
      px={2}
      sx={{ flex: 1, overflowY: "auto" }}
    >
      {chatMessages?.map(
        ({ username: otherUsername, message, createdDate }, index) => {
          const self = otherUsername === username;

          return (
            <Grid
              key={username + index}
              item
              sx={(theme) => ({
                alignSelf: self ? "flex-end" : "flex-start",
                maxWidth: "50%",
              })}
            >
              <Typography
                fontSize={11}
                sx={{
                  textAlign: self ? "right" : "left",
                }}
                px={1}
              >
                {otherUsername}
              </Typography>
              <Typography
                sx={(theme) => ({
                  backgroundColor: self
                    ? theme.palette.primary.light
                    : theme.palette.grey["400"],
                    fontSize:'18px'
                  // borderRadius: theme.shape.borderRadius,
                })}
                px={1}
              >
                {message}
              </Typography>

              <Typography
                fontSize={11}
                sx={{
                  textAlign: self ? "right" : "left",
                }}
                px={1}
              >
                {format(new Date(createdDate), "hh:mm a")}
              </Typography>
            </Grid>
          );
        }
      )}
    </Stack>
  );

  // Send Message Input
  const controlsView = () => (
    <Grid container item padding={3} alignItems="center">
      <Grid item flex={1}>
        <TextField
          autoFocus
          variant="standard"
          fullWidth
          value={message}
          placeholder="Write your message here..."
          onChange={(e) => setMessage(e.target.value)}
          sx={(theme) => ({
            border: "3px solid black",
            borderRadius: 0,
            paddingLeft: 2,
            fontFamily:'Times New Roman'
          })}
          InputProps={{
            disableUnderline: true,
          }}
        />
      </Grid>
      <Grid item>
        <Button type="submit"
        sx={(theme)=>({
          border:'1px solid black',
          backgroundColor:'#2c7DA0',
          color:'white'
        })}>Send</Button>
      </Grid>
    </Grid>
  );

  return (
    <form onSubmit={sendMessage}>
      <Grid
        container
        direction="column"
        alignItems="center"
        style={{ height: "100vh", backgroundColor: "#012a4a", padding: 5 }}
      >
        <UsernameDialog username={username} setUsername={setUsername} />

        <Stack
          spacing={1}
          sx={(theme) => ({
            backgroundColor: "#fff",
            height: "80vh",
            width: "40%",
            marginTop:"50px",
            borderRadius: "0px",
            borderColor: "black",
            border: "10px solid black",
          })}
        >
          {welcomeMessageView()}

          {messagesView()}

          {controlsView()}
        </Stack>
      </Grid>
    </form>
  );
}

export default ChatApp;
