let express = require("express");
let app = express();
let httpServer = require("http").createServer(app);
let io = require("socket.io")(httpServer);

let connections = [];

io.on("connect", (socket) => {
  connections.push(socket);
  console.log(`${socket.id} has connected`);

  socket.emit("getCanvas", {id : connections[-1].id})

  socket.on("recievedCanvas", (data) => {
    
  })

  socket.on("propogate", (data) => {
    connections.map((con) => {
      if (con.id !== socket.id) {
        con.emit("onpropogate", data);
      }
    });
  });

  //receive and send an image of entire canvas

  socket.on("canvas-data", (data) => {

    connections.forEach((con) => {
      if (con.id != socket.id){
        con.emit("canvas-data", data);
      }
    })
    console.log("canvas data recieved")
  })

  socket.on("draw", (data) => {
    connections.forEach((con) => {
      if (con.id !== socket.id) {
        con.emit("ondraw", {x: data.x , y: data.y});
      }
    });
  });

//emit brush size data

  socket.on("widthChange", (data) => {
    console.log("width change recieved")
    connections.forEach((con)=>{
      if (con.id !== socket.id){
        con.emit("widthChange", {width: data.width})
        
      }
    })
    console.log(data.width)
  });

//emit colour change of brush

  socket.on("colourChange", (data) =>{
    console.log("colourChange recieved")
    connections.forEach((con)=>{
      if (con.id !== socket.id){
        con.emit("colourChange", {colour: data.colour})
        
      }
    })
    console.log("colourChange emitted")
  });

  //emit message to clear canvas

  socket.on("canvasClear", () => {
    console.log("clear canvas recieved")
    connections.forEach((con)=>{
      if (con.id !== socket.id){
        con.emit("canvasClear")
      }
    })
  })


socket.on("down", (data) => {
    connections.forEach((con) => {
      if (con.id !== socket.id) {
        con.emit("ondown", {x: data.x , y: data.y});
      }
    });
  });


  socket.on("disconnect", (reason) => {
    console.log(`${socket.id} is disconnected`);
    connections = connections.filter((con) => con.id !== socket.id);
  });
});

app.use(express.static("public"));

let PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => console.log(`Server started on port ${PORT}`));