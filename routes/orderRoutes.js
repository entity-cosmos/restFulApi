const express = require("express");
const router = express.Router();
const dynamodb = require("../db/dynamoDb");

router.get("/", (req, res, next) => {
  const params = {
    TableName: "orders",
  };

  dynamodb.scan(params, (err, data) => {
    if (err) {
      console.log("Internal server error");
      res.status(500).json({
        message: "Internal server error",
      });
    } else {
      console.log("Item found:", data);
      res.status(200).json(data);
    }
  });
});

router.post("/", (req, res, next) => {
  // const _id = parseInt(uuidv4());
  const _id = Math.floor(
    Math.random() * Math.floor(Math.random() * Date.now())
  );
  try {
    // Extract the required attributes from the request body
    const { productId, qty } = req.body;
    let item = {
      _id,
      productId,
      qty,
    };

    // Define the DynamoDB parameters for inserting the new item
    const params = {
      TableName: "orders",
      Item: item,
    };

    // Insert the new item into the DynamoDB table
    dynamodb.put(params).promise();

    // Return a success response with the new item
    res.status(201).json({
      message: "Order created succesfully",
      item,
    });
  } catch (err) {
    // Handle any errors and return an error response
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:orderId", (req, res, next) => {
  const params = {
    TableName: "orders",
    Key: {
      _id: Number(req.params.orderId),
    },
  };

  dynamodb.get(params, (err, data) => {
    if (err) {
      console.log("Internal server error");
      res.status(500).json({
        error: "Internal server error",
      });
    } else if (!data.Item) {
      console.log("Item not found");
      res.status(404).json({
        error: "Item not found",
      });
    } else {
      console.log("Item found: ", data.Item);
      res.status(200).json(data.Item);
    }
  });
});

router.delete("/:orderId", (req, res, next) => {
  const params = {
    TableName: "orders",
    Key: {
      _id: Number(req.params.orderId),
    },
  };

  dynamodb.delete(params, (err, data) => {
    if (err) {
      console.log("Internal server error");
      res.status(500).json({
        error: "Internal server error",
      });
    } else if (data) {
      console.log("Item is deleted", data);
      res.status(204).json(data);
    } 
  });
});

module.exports = router;
