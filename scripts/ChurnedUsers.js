/**
 * Finding amount of churned users for selected date
 * User is considered churned when his last purchase
 * at the time of SELECTED_DATE is exactly between
 * SELECTED_DATE - CHURN_DELAY - CHURN_DURATION and
 * SELECTED_DATE - CHURN_DELAY
 */

load('scripts/variables.js')

// SELECTED_DATE - CHURN_DELAY - CHURN_DURATION
var start = nov11;

// SELECTED_DATE - CHURN_DELAY
var mid = nov18;

// SELECTED_DATE
var end = nov25;

print('--');
print('Users whose last purchase at the time of ' +
  end.getTimestamp() + ' was made in period from ' +
  start.getTimestamp() + ' to ' + mid.getTimestamp()
);

db.purchases.aggregate([
  // Filtering by date range
  {
    $match: {
      _id: {
        $gt: start
        ,
        $lt: end
      }
    }
  }

  // Grouping by user
  ,
  {
    $group: {
      _id: "$user"
      ,
      last_purchase: { $max: "$_id" }
      // ,
      // count: { $sum: 1 }
    }
  }


  // Filtering by last purchase date
  ,
  {
    $match: {
      last_purchase: { $lt: mid }
    }
  }

  // Sorting
  // ,
  // {
  //   $sort: {
  //     count: -1
  //   }
  // }

  // Projecting
  // ,
  // {
  //   $project: {
  //     last_purchase: 1,
  //     count: 1,
  //     dateString: {
  //       $dateToString: {
  //         date: "$last_purchase",
  //         format: "%Y-%m-%d"
  //       }
  //     }
  //   }
  // }

  // Counting
  ,
  {
    $count: "count"
  }

  // Limiting
  // ,
  // {
  //   $limit: 5
  // }
]).forEach(function (doc) { printjson(doc) });
print('--');
