const NodeIODB = require("./index");
(async () => {

    // Create a new Pocket
    let nodeiodb = new NodeIODB("blog");

    // Add a collection
    var articleCollection = await nodeiodb.collection("article");

    // Add a item to the collection
    articleCollection.insert({
        name: "Foo Bar",
        age: 18
    });
    articleCollection.insert({
        name: "Baz Foo",
        age: 34
    });

    // Add an array of items
    articleCollection.insert([{
        name: "Pete Johnson",
        age: 44
    }, {
        name: "Joe Bloggs",
        age: 19
    }]);

    // Get all items from a collection
    console.log("all\n");
    console.table(articleCollection.find());

    // Update item
    articleCollection.update({
        name: "Foo Bar"
    }, {
        age: 19
    });
    // Query for specific items
    console.log("update\n");
    console.table(articleCollection.find({
        age: {
            $gt: 18
        }
    }));

    // Get one item
    console.table(articleCollection.findOne({
        name: "Foo Bar"
    }));

    // Restore from database
    nodeiodb.restore();

    console.table(articleCollection.find());

    // Add an array of items
    articleCollection.insert([{
        name: "Pete Johnson",
        age: 44
    }, {
        name: "Joe Bloggs",
        age: 19
    }]);

    console.table(articleCollection.find());


    // Remove item
    articleCollection.remove();
    console.log("after remove\n");
    console.table(articleCollection.find());


    // Commit collection to database
    articleCollection.commit();
})();