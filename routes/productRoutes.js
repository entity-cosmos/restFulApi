const express = require("express");
const router = express.Router();
const dynamodb = require("../db/dynamoDb");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });
router.get("/", (req, res, next) => {
  const params = {
    TableName: "products",
  };

  dynamodb.scan(params, (err, data) => {
    if (err) {
      console.log("Error fetching item:", err);
      res.status(500).json({ error: "Internal server error" });
    } else if (data) {
      console.log("Item found:", data);
      res.status(200).json(data);
    }
  });
});

router.post("/", upload.single("productImage"), (req, res, next) => {
  const id = Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
  try {
    console.log(req.file);
    // Extract the required attributes from the request body
    let item = {
      id: id,
      name: req.body.name,
      price: req.body.price,
      productImage: req.file.path,
    };

    // Define the DynamoDB parameters for inserting the new item
    const params = {
      TableName: "products",
      Item: item,
    };

    // Insert the new item into the DynamoDB table
    dynamodb.put(params).promise();

    // Return a success response with the new item
    res.status(201).json({
      message: "product created succesfully",
      item,
    });
  } catch (err) {
    // Handle any errors and return an error response
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:productId", (req, res, next) => {
  const params = {
    TableName: "products",
    Key: {
      id: Number(req.params.productId),
    },
  };

  dynamodb.get(params, (err, data) => {
    if (err) {
      console.log("Error fetching item:", err);
      res.status(500).json({ error: "Internal server error" });
    } else if (!data.Item) {
      console.log("Item not found");
      res.status(404).json({ error: "Item not found" });
    } else if (data.Item) {
      console.log("Item found:", data.Item);
      res.status(200).json(data.Item);
    }
  });
});

router.patch("/:productId", (req, res, next) => {
  const params = {
    TableName: "products",
    Key: {
      id: Number(req.params.productId),
    },

    UpdateExpression: "set #name = :name, #price = :price",
    ExpressionAttributeNames: {
      "#name": "name",
      "#price": "price",
    },
    ExpressionAttributeValues: {
      ":name": req.body.name,
      ":price": req.body.price,
    },
    ReturnValues: "ALL_NEW",
  };

  dynamodb.update(params, (err, data) => {
    if (err) {
      console.log("Error while updating item: ", err);
      res.status(500).json({
        message: "Internal server error",
      });
    } else if (data) {
      console.log("Record updated successfully: ", data);
      res.status(200).json(data.Attributes);
    }
  });
});

router.delete("/:productId", (req, res, next) => {
  const params = {
    TableName: "products",
    Key: {
      id: Number(req.params.productId),
    },
  };

  dynamodb.delete(params, (err, data) => {
    if (err) {
      console.log("Error while deleting item: ", err);
      res.status(500).json({
        message: "Internal server error",
      });
    } else if (data) {
      console.log("Record deleted successfully: ", data);
      res.status(204).json({
        message: "Item deleted successfully",
      });
    }
  });
});

module.exports = router;
