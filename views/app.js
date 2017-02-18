var app = new Vue({
  el: '#app',
  data: {
    messages: ["hi", "judy"]
  }
})

var socket = io.connect('https://fierce-garden-60722.herokuapp.com/');
socket.on('new_message', function (data) {
	console.log(data.message);
	app.messages.push(data.message);
});

socket.on('news', function (data) {
    console.log(data);
  });