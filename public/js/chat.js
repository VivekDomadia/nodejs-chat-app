const socket = io();

const showMessage = (msg) => {
  $("#messages").append(msg);
  $("#messages").scrollTop($("#messages").prop("scrollHeight"));
};

// Option
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("username");
const room = urlParams.get("room");

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
  $("#room").text("Room " + room);
});

socket.on("message", (message) => {
  console.log(message);

  const html = Mustache.render($("#messageTemplete").html(), {
    username: message.username,
    message: message.text,
    createAt: moment(message.createAt).format("h:mm a"),
  });
  showMessage(html);
});

socket.on("locationMessage", (message) => {
  console.log(message);

  const html = Mustache.render($("#locationTemplete").html(), {
    username: message.username,
    url: message.url,
    createAt: moment(message.createAt).format("h:mm a"),
  });

  showMessage(html);
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render($("#userListTemplete").html(), { users });
  $("#userList").html(html);
});

$("#sendMessageBtn").click(() => {
  $("#sendMessageBtn").attr("disabled", "disabled");
  const text = $("#message").val();
  $("#message").val("");

  socket.emit("sendMessage", text, () => {
    console.log("Message delevered!");
    $("#sendMessageBtn").removeAttr("disabled");
  });
});

$("#sendLocationBtn").click(() => {
  if (!navigator.geolocation) {
    return alert("GeoLocation not suppert by your browser!!");
  }

  $("#sendLocationBtn").attr("disabled", "disabled");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      socket.emit("sendLocation", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    },
    (error) => {
      if (error) {
        return alert(error.message);
      }
    }
  );

  $("#sendLocationBtn").removeAttr("disabled");
});

$("#message").keypress((e) => {
  if (e.which == 13) {
    if ($("#message").val() !== "") {
      $("#sendMessageBtn").click();
    }
  }
});

$("#sidebarToggler, #overlay").click(() => {
  $("#overlay").toggle("slow");
  $("#sidebar").toggle("slow");
});

$("#quit").click(() => {
  if (confirm("Are u sure want to leave this room?")) {
    location.href = "/";
  }
});
