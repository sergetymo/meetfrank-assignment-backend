/**
 * Finding amount of churned users for selected date
 * User is considered churned when his *last purchase*
 * is exactly between
 * SELECTED_DATE - CHURN_DELAY - CHURN_DURATION and
 * SELECTED_DATE - CHURN_DELAY
 */

load('scripts/variables.js')

// SELECTED_DATE - CHURN_DELAY - CHURN_DURATION
var start = nov11;

// SELECTED_DATE - CHURN_DELAY
var end = nov18;

print('--');
print('Users who mage at least ' + minPurchasesToBeActive +
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
  // ,
  // {
  //   $match: {
  //     count: { $gt: minPurchasesToBeActive }
  //   }
  // }

  // Counting
  // ,
  // {
  //   $count: "count"
  // }
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
