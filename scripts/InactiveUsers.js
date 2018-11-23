/**
 * Finding amount of inactive users for selected date
 * User is considered inactive when his last purchase
 * at the time of SELECTED_DATE is before
 * SELECTED_DATE - CHURN_DELAY - CHURN_DURATION
 */

load('scripts/variables.js')

// SELECTED_DATE - CHURN_DELAY - CHURN_DURATION
var start = nov11;

// SELECTED_DATE
var end = nov25;

print('--');
print('Users whose last purchase at the time of ' +
  end.getTimestamp() + ' was made before ' + start.getTimestamp()
);

db.purchases.aggregate([
  // Filtering by date range
  {
    $match: {
      _id: {
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
      last_purchase: { $lt: start }
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
