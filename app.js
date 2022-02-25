"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _  = require("lodash");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Yuuto20:Test1234@cluster0.c8tzf.mongodb.net/todolistDB?retryWrites=true&w=majority", { useNewUrlParser: true });

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todoList!",
});

const item2 = new Item({
  name: "Hit the  + button to add new items.",
});

const item3 = new Item({
  name: "<-- Click here when the work is complete.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  Item.find({}, function (err, items) {
    if (items.length === 0) {
      Item.insertMany(defaultItems, function (err) {
      if (err) console.log(err);
      else console.log("Successfully inserted the items");
      });
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "Today", newListItems: items });
    }
  });
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, result) {
    if (!err) {
      if (!result) {
        // Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        // Show an existing list
        res.render("list",{ listTitle: result.name, newListItems: result.items })
      }
    }
  });
});

app.get("/about", (req, res) => {
res.render("about");
});

app.post("/", (req, res) => {
  const itemName = req.body.newInput;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
  res.redirect("/");
  }
  else {
    List.findOne({name: listName}, function(err, foundItem) {
      foundItem.items.push(item);
      foundItem.save();
      res.redirect("/" + listName);
    });
  }  
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) console.log("Successfully removed the element");
  
      res.redirect("/");
    }); 
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err) res.redirect("/" + listName);
    });
  }

});

let port = process.env.PORT;
if (port === null || port === "") {
  port = 3000
}

app.listen(port, () => {
  console.log(`The server is running on port ${port}`);
});
