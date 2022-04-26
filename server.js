const http = require('http');
const mongoose = require('mongoose');
mongoose
    .connect("mongodb://localhost:27017/test")
    .then(() => console.log('資料庫連接成功'))
    .catch(error => console.log(error));

// Schema
const roomSchema = new mongoose.Schema(
    {
        name: String,
        price: {
            type: Number,
            required: [true, "價格必填"]
        },
        rating: Number,
        createdAt: {
            type: Date,
            default: Date.now,
        },
        idCardNo: {
            type: String,
            select: false
        }
    },
    { versionKey: false }
)

// Model
const Room = mongoose.model('Room', roomSchema);

Room.create({
    name: "豪華雙人房",
    price: 2500,
    rating: 4.5,
    idCardNo: "4345344564"
}).then(res => console.log(res, "新增成功")
).catch(err => console.log(err));

const requestListener = async (req,res)=>{
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }
    if(req.url=="/rooms" && req.method=="GET"){
        const rooms = await Room.find();
        res.writeHead(200,headers);
        res.write(JSON.stringify({
            "status":"success",
            rooms
        }))
        res.end()
    }
}

const server = http.createServer(requestListener);
server.listen(3000);