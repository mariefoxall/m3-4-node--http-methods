"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { stock, customers } = require("./data/promo");

express()
  .use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  })
  .use(morgan("tiny"))
  .use(express.static("public"))
  .use(bodyParser.json())
  .use(express.urlencoded({ extended: false }))
  .set("view engine", "ejs")

  // endpoints

  .post("/order", (req, res) => {
    console.log(req.body);
    if (req.body.order === "bottle" || req.body.order === "socks") {
      req.body.size = "no size";
    }
    console.log(req.body);
    customers.forEach((customer) => {
      if (
        (req.body.givenName === customer.givenName &&
          req.body.surname === customer.surname) ||
        req.body.email === customer.email ||
        req.body.address === customer.address
      ) {
        res.status(403).json({ status: "error", error: "repeat-customer" });
      } else if (req.body.country !== "Canada") {
        res.status(403).json({ status: "error", error: "undeliverable" });
      } else if (Object.values(req.body).includes("undefined")) {
        res.status(403).json({ status: "error", error: "missing-data" });
      } else if (
        Number(stock[`${req.body.order}`]) === 0 ||
        Number(stock[`${req.body.order}`][`${req.body.size}`]) === 0
      ) {
        res.status(403).json({ status: "error", error: "unavailable" });
      } else {
        res.status(200).json({ status: "success" });
      }
    });
  })

  .get("/order-confirmed", (req, res) => {
    console.log(req.query);
    // console.log(queryString);
    console.log("hello");
    res.status(200);
    // res.send("everything is cool, great order buddy!");
    let customerOrder = "";
    if (req.query.customerOrder === "bottle") {
      customerOrder = "a bottle";
    } else if (req.query.customerOrder === "socks") {
      customerOrder = "a pair of socks";
    } else if (req.query.customerOrder === "shirt") {
      customerOrder = `a shirt in size ${req.query.customerSize}`;
    }

    res.render("order-confirmed", {
      customerName: req.query.customerName,
      customerOrder: customerOrder,
      customerProvince: req.query.customerProvince,
    });
  })

  .get("*", (req, res) => res.send("Dang. 404."))
  .listen(8000, () => console.log(`Listening on port 8000`));
