var canvas = document.getElementById("canvas");
var button = document.getElementById("textButton");

canvas.width = window.innerWidth - 60;
canvas.height = 400;

var io = io.connect("http://localhost:8080/");

var ctx = canvas.getContext("2d");

let x;
let y;
let mouseDown = false;
this.canvas = canvas;
let line_width = 2;
ctx.lineWidth = line_width;


//brush size changing 

function change_width(element){
  ctx.lineWidth = parseInt(element.value)
  io.emit("widthChange",{width: element.value})
}

io.on("widthChange", (data) =>{
  ctx.lineWidth = parseInt(data.width)
  console.log(data.width)
}
)


//Colour Changing

function change_colour(element) {
  let colour = element.style.background
  ctx.strokeStyle = colour;
  io.emit("colourChange", {colour: colour} )
}

//used to get colour from change 
function change_colour_picker(element){
  let colour = element.value
  ctx.strokeStyle = colour;
  io.emit("colourChange", {colour: colour} )
}

io.on("colourChange", ({colour}) =>{
  ctx.strokeStyle = colour;
  console.log(colour)
})


//Cearing Whiteboard

function clearCanvas(){
  ctx.fillStyle = "white";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  io.emit("canvasClear");

}

io.on("canvasClear",() =>{
  console.log("clear canvas recieved")
  ctx.fillStyle = "white";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
)


//Drawing Lines

window.onmousedown = (e) => {
  ctx.beginPath()
  ctx.moveTo(x , y);
  io.emit("down" , {x , y})
  mouseDown = true
};

window.onmouseup = (e) => {
  mouseDown = false;
};

io.on("ondraw", ({x , y}) => {
  ctx.lineTo(x, y);
  ctx.stroke();
});

io.on("ondown" , ({x , y}) => {
  ctx.beginPath()
  ctx.moveTo(x , y);
})

window.onmousemove = (e) => {
  x = e.clientX;
  y = e.clientY;
  
  if(mouseDown) {
    io.emit("draw" , {x , y});
    ctx.lineTo(x, y);
    ctx.stroke();

    //send entire image of canvas
    /**
    function sendImage(){
      var base64ImageData = canvas.toDataURL("./img/png");
      io.emit("canvas-data", {base64ImageData : base64ImageData});
      console.log("canvas data sent");

    }
    sendImage();
     */
  }

  
  io.on("getCanvas", (data) =>{
    console.log("recieved message to send canvas ")
    var base64ImageData = canvas.toDataURL("./img/png");
    io.emit("sentCanvas", {base64ImageData})
    console.log("sent canvas to server")

  })

  io.on("canvas-data", ({base64ImageData}) =>{
    var img = new Image();
    img.onload = function(){
      ctx.drawImage(img, 0, 0);
    }
    img.src = base64ImageData;
    console.log("canvas data recieved");
  })

};

let textMode = false; // Initialize textMode to false

function toggleTextMode() {
  textMode = !textMode; // Toggle the textMode value between true and false
  if (textMode) {
    button.classList.add("active"); // Add a CSS class to indicate the active mode
  } else {
    button.classList.remove("active"); // Remove the CSS class when textMode is false
  }
}

function addText(event) {
  if (!textMode) {
    return; // Exit the function if textMode is false
  }

  var text = prompt("Enter the text:");
  if (text) {
    var rect = canvas.getBoundingClientRect();
    x = event.clientX - rect.left;
    y = event.clientY - rect.top;

    ctx.font = "20px Arial"; // Set the font size and type
    ctx.fillStyle = "#000000"; // Set the text color
    ctx.fillText(text, x, y); // Specify the text and its position on the canvas
  }
  button.classList.remove("active");
  textMode = false
}

button.addEventListener("click", toggleTextMode);
canvas.addEventListener("click", addText);