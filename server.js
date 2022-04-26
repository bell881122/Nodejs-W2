const http = require('http');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: "./.env" })
let url = process.env.DATABASE;
const dbName = "hotel";
url = url.replace("<password>", process.env.DATABASE_PASSWORD)
url = url.replace("<dbName>", dbName)

mongoose
    .connect(url)
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

const requestListener = async (req, res) => {
    let body = "";
    req.on("data", chunk => body += chunk);

    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }

    const showRooms = async () => {
        const rooms = await Room.find();
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            rooms
        }))
        res.end();
    }

    const handleError = err => {
        console.log(err);
        let error;
        [...Object.keys(err.errors)].forEach(el =>
            error = err.errors[el].properties?.message ?
                { ...error, [el]: err.errors[el].properties.message } :
                { ...error, [el]: err.errors[el].message }
        );
        res.writeHead(400, headers);
        res.write(JSON.stringify({
            "status": "false",
            error
        }))
        res.end();
    }

    const getId = path => path.split("/").pop();

    if (req.url == "/rooms" && req.method == "GET") {
        showRooms();
    } else if (req.url == "/rooms" && req.method == "POST") {
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                Room.create({
                    name: data.name,
                    price: data.price,
                    rating: data.rating,
                    idCardNo: data.idCardNo
                }).then(async (result) => {
                    console.log(result, "新增成功")
                    showRooms();
                }).catch(error => {
                    handleError(error)
                });
            } catch (error) {
                handleError(error);
            }
        })
    } else if (req.url == "/rooms" && req.method == "DELETE") {
        await Room.deleteMany({});
        showRooms();
    } else if (req.url.startsWith("/rooms/") && req.method == "DELETE") {
        const id = getId(req.url);
        await Room.findByIdAndDelete(id);
        showRooms();
    } else if (req.url.startsWith("/rooms/") && req.method === "PATCH") {
        req.on('end', async () => {
            try {
                const id = getId(req.url);
                const data = JSON.parse(body);
                let newData;
                [...Object.keys(data)].forEach(field => {
                    if (["name", "price", "rating", "idCardNo"].indexOf(field) > -1)
                        newData = { ...newData, [field]: data[field] }
                })
                await Room.findByIdAndUpdate(id, newData);
                showRooms();
            } catch (error) {
                handleError(error);
            }
        })
    }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT | 3000);