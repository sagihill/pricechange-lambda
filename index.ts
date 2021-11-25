const axios = require("axios").default;

type PriceInsertEvent = {
  id: number;
  price: number;
  symbol: string;
};

exports.handler = async (event: PriceInsertEvent) => {
  try {
    console.log("Started handling price change event: ", event);
    const lastPrice = await getLastPrice(event.id, event.symbol);
    const priceChange = round((event.price - lastPrice) / 100);
    console.log(`Current price change is ${priceChange}`);
    const priceChangeId = await insertPriceChange(event.symbol, priceChange);
    console.log("Finished handling price change event...");
    return priceChangeId;
  } catch (error) {
    console.log("Something went wrong handling event", [error, event]);
  }
};

async function getLastPrice(id: number, symbol: string): Promise<number> {
  console.log(`Getting last price of ${symbol}`);
  const connection = {
    ssl: { rejectUnauthorized: false },
    host: "tradewatch-1.ckjhl9zn95xm.eu-central-1.rds.amazonaws.com",
    port: "3306",
    user: "admin",
    password: "sagi1991",
    database: "TradeWatch",
  };
  const knex = require("knex")({
    client: require("knex/lib/dialects/mysql"),
    connection,
  });

  const res = await knex("Prices").where("id", id - 1);
  const lastPrice = res[0].price;
  console.log(`Last price of ${symbol} was ${lastPrice}`);
  return lastPrice;
}

async function insertPriceChange(
  symbol: string,
  priceChange: number
): Promise<number> {
  console.log("Inserting price change to database...");
  const connection = {
    ssl: { rejectUnauthorized: false },
    host: "tradewatch-1.ckjhl9zn95xm.eu-central-1.rds.amazonaws.com",
    port: "3306",
    user: "admin",
    password: "sagi1991",
    database: "TradeWatch2",
  };
  const knex = require("knex")({
    client: require("knex/lib/dialects/mysql"),
    connection,
  });

  const res = await knex()
    .select().from("PriceChanges")
  console.log(JSON.stringify(res));
  return res[0];

  // const res = await knex("PriceChanges").insert({ symbol, price: priceChange });
  // console.log("Finished inserting price change into the database...");
  // return res[0];
}

function round(num: number): number {
  var m = Number((Math.abs(num) * 100).toPrecision(15));
  return (Math.round(m) / 100) * Math.sign(num);
}
