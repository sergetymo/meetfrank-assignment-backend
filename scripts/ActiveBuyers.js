/**
 * Finding amount of active buyers for selected date
 * User is considered as active buyer when he performs
 * at least MIN_PURCHASES between
 * SELECTED_DATE - ACTIVE_PERIOD and SELECTED_DATE date range
 */

load('scripts/variables.js')

// SELECTED_DATE - ACTIVE_PERIOD
var start = nov4;

// SELECTED_DATE
var end = nov11;

//

print('--');
print('Users who made at least ' + minPurchasesToBeActive +
  ' purchases in period from ' +
  start.getTimestamp() + ' to ' + end.getTimestamp()
);

db.purchases.aggregate([
  // Filtering by date range
  {
    $match: {
      _id: {
        $gte: start
        ,
        $lte: end
      }
    }
  }

  // Grouping by user
  ,
  {
    $group: {
      _id: "$user"
      ,
      purchase_times: { $addToSet: "$_id" }
      ,
      count: { $sum: 1 }
    }
  }

  // Filtering by number of purchases
  ,
  {
    $match: {
      count: { $gt: minPurchasesToBeActive }
    }
  }

  // Counting
  ,
  {
    $count: "count"
  }
  //     ,
  //     {
  //         $group: {
  //             _id: null,
  //             ave: { $avg: "$count" }
  //         }
  //     }
  //     ,
  //     {
  //         $group: {
  //             _id: "$count",
  //             users: { $push: "$_id" }
  //         }
  //     }
  //     ,
  //     {
  //         $sort: { _id: -1 }
  //     }
]).forEach(function (doc) { printjson(doc) });
print('--');
