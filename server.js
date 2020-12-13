var express = require('express');
var app = express();
var sql = require('mssql/msnodesqlv8')
var bodyParser = require("body-parser")
var cors = require("cors")
require("dotenv").config();

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let config = {
  user: 'sa',
  password: '123456789',
  database: "BlackStone",
  server: "localhost",
  driver: "msnodesqlv8",
  options: {
      enableArithAbort: true
  }
}

const conn = new sql.ConnectionPool(config);

conn.connect(err => {
    if (err) {
        console.log('Error: ', err)
    } else {
        console.log('Database is connected')
    }
})

app.get('/', (req, res) => res.json('Server is connected'))

app.get('/api/getAll', async (req, res) => {
    try {
        let pool = await conn.connect(config)
        let products = await pool.request().query("SELECT * FROM [CantProductInfoes]")

        res.json(products.recordsets)
    } catch (error) {
        res.status(500).json(error)
    }
})

app.post('/api/post-product', async (req, res) => {
    try {
        let data = req.body
        let pool = await conn.connect(config);
        let product = await pool.request()
            .input('ProductCode', sql.NVarChar, data.ProductCode)
            .input('Name', sql.NVarChar, data.Name)
            .input('GroupId', sql.Int, data.GroupId)
            .input('Unit', sql.NVarChar, data.Unit)
            .input('PurchaseRate', sql.Float, data.PurchaseRate)
            .input('SaleRate', sql.Float, data.SaleRate)
            .input('WholeSaleRate', sql.Int, data.WholeSaleRate)
            .input('ROL', sql.Int, data.ROL)
            .input('QtyPerCartoonOrBox', sql.Int, data.PurchaseRate)
            .query(`INSERT INTO CantProductInfoes 
                (ProductCode, Name, GroupId, Unit, PurchaseRate, SaleRate, WholeSaleRate, ROL, QtyPerCartoonOrBox) 
                VALUES(@ProductCode, @Name, @GroupId, @Unit, @PurchaseRate, @SaleRate, @WholeSaleRate, @ROL, @QtyPerCartoonOrBox)`
            );
        if (product) {
            res.json(product)
        }
    }
    catch (error) {
        console.log("Error", error)
        res.status(500).json(error)
    }
})

app.listen(process.env.PORT, () =>
  console.log("Server is running on port", process.env.PORT)
);