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
// Entity
const testRoom = new Room({
    name: '豪華單人房',
    price: 2000,
    rating: 4.5
})

testRoom.save()
    .then(() => console.log('資料新增成功'))
    .catch(error =>
        Object.keys(error.errors).forEach(filed =>
            error.errors[filed].properties ?
                console.log(error.errors[filed].properties.message) :
                console.log(`Required type: ${error.errors[filed].kind}. Value type: ${error.errors[filed].valueType}.`)
        )
    );

const requestListener = async (req, res) => {
    res.end();
}
const server = http.createServer(requestListener);
server.listen(3000);