var app = new Vue({
  el: '#app',
  data: {
    messages: ["hi", "judy"]
  }
})


var socket = io.connect('https://fierce-garden-60722.herokuapp.com/');
// var socket = io.connect('http://localhost:5000');
socket.on('new_message', function (data) {
	console.log(data);
	app.messages.push(data.message);
});

socket.on('news', function (data) {
    console.log(data);
  });