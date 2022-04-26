const http = require('http');
const mongoose = require('mongoose');
mongoose
    .connect("mongodb://localhost:27017/test")
    .then(() => console.log('資料庫連接成功'))
    .catch(error => console.log(error));

// Schema
const roomSchema = {
    name: String,
    price: {
        type: Number,
        required: [true, "價格必填"]
    },
    rating: Number
}
// Model
const Room = mongoose.model('Room', roomSchema);

const requestListener = async (req, res) => {
    res.end();
}
const server = http.createServer(requestListener);
server.listen(3000);