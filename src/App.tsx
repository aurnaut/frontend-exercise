import { default as React, useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactTooltip from "react-tooltip";

function App() {
  const [ethUsdData, setEthUsdData] = useState("");
  const [ethGbpData, setEthGbpData] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [colorUsdClass, setColorUsdClass] = useState("text-gray-500");
  const [colorGbpClass, setColorGbpClass] = useState("text-gray-500");
  const [unchangedUsdValue, setUnchangedUsdValue] = useState();
  const [changedUsdValue, setChangedUsdValue] = useState();
  const [unchangedGbpValue, setUnchangedGbpValue] = useState();
  const [changedGbpValue, setChangedGbpValue] = useState();

  const usdETHPair = "ETHUSD";
  const gbpETHPair = "ETHGBP";

  let temporaryLastUsdEthPrice = 0;
  let temporaryLastGbpEthPrice = 0;

  let config = {
    headers: { "Access-Control-Allow-Origin": "*" },
  };

  function findFirstDiffPos(a: string, b: string) {
    var shorterLength = Math.min(a.length, b.length);

    for (var i = 0; i < shorterLength; i++) {
      if (a[i] !== b[i]) return i;
    }

    if (a.length !== b.length) return shorterLength;

    return -1;
  }

  useEffect(() => {
    const getEthData = () => {
      //Get ETH/USD pair
      axios
        .get(`https://dev.ebitlabs.io/api/v1/fx/${usdETHPair}/ohlc`, config)
        .then((res) => {
          setEthUsdData(res.data);
          setIsLoading(false);
          let currentUsdEth = parseFloat(res.data.close);

          if (
            temporaryLastUsdEthPrice < currentUsdEth &&
            temporaryLastUsdEthPrice !== 0
          ) {
            setColorUsdClass("text-green-500");
          }
          if (temporaryLastUsdEthPrice > currentUsdEth) {
            setColorUsdClass("text-red-500");
          }

          setUnchangedUsdValue(
            res.data.close.slice(
              0,
              findFirstDiffPos(
                temporaryLastUsdEthPrice.toString(),
                currentUsdEth.toString(),
              ),
            ),
          );
          setChangedUsdValue(
            res.data.close.slice(
              findFirstDiffPos(
                temporaryLastUsdEthPrice.toString(),
                currentUsdEth.toString(),
              ),
              res.data.close.length,
            ),
          );

          temporaryLastUsdEthPrice = currentUsdEth;
        })
        .catch((err) => {
          setError("An error occurred. Awkward..");
          setIsLoading(false);
        });

      // /Get ETH/GBP pair
      axios
        .get(`https://dev.ebitlabs.io/api/v1/fx/${gbpETHPair}/ohlc`, config)
        .then((res) => {
          setEthGbpData(res.data);
          setIsLoading(false);
          let currentGbpEth = parseFloat(res.data.close);
          if (
            temporaryLastGbpEthPrice < currentGbpEth &&
            temporaryLastGbpEthPrice !== 0
          ) {
            setColorGbpClass("text-green-500");
          }

          if (temporaryLastGbpEthPrice > currentGbpEth) {
            setColorGbpClass("text-red-500");
          }

          setUnchangedGbpValue(
            res.data.close.slice(
              0,
              findFirstDiffPos(
                temporaryLastGbpEthPrice.toString(),
                currentGbpEth.toString(),
              ),
            ),
          );
          setChangedGbpValue(
            res.data.close.slice(
              findFirstDiffPos(
                temporaryLastGbpEthPrice.toString(),
                currentGbpEth.toString(),
              ),
              res.data.close.length,
            ),
          );

          temporaryLastGbpEthPrice = currentGbpEth;
        })
        .catch((err) => {
          setError("An error occurred. Awkward..");
          setIsLoading(false);
        });
    };

    //Get initial data
    getEthData();

    //Call APIs every 5 seconds
    setInterval(() => {
      getEthData();
    }, 5000);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="pt-12 bg-gray-50 sm:pt-16">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Ethereum Price
          </h2>
        </div>
      </div>
      <div className="pb-12 mt-10 bg-white sm:pb-16">
        <div className="relative">
          <div className="absolute inset-0 h-1/2 bg-gray-50" />
          <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto flex justify-center items-center">
              <dl className="w-1/3  bg-white rounded-lg shadow-lg">
                <ReactTooltip />
                <div
                  data-tip={
                    ethUsdData &&
                    new Date(
                      parseFloat(
                        ethUsdData.startTime.seconds +
                          "." +
                          ethUsdData.startTime.microseconds,
                      ) * 1000,
                    ).toISOString()
                  }
                  className="flex flex-col p-6 text-center border-t border-gray-100"
                >
                  <dt className="order-2 mt-2 text-lg font-medium leading-6 text-gray-500">
                    ETH/USD
                  </dt>
                  <dd
                    className={`order-1 text-5xl font-extrabold text-gray-500`}
                  >
                    ${unchangedUsdValue}
                    <span className={colorUsdClass}>{changedUsdValue}</span>
                  </dd>
                </div>
              </dl>

              <dl className="w-1/3  bg-white rounded-lg shadow-lg">
                <ReactTooltip />
                <div
                  data-tip={
                    ethGbpData &&
                    new Date(
                      parseFloat(
                        ethGbpData.startTime.seconds +
                          "." +
                          ethGbpData.startTime.microseconds,
                      ) * 1000,
                    ).toISOString()
                  }
                  className="flex flex-col p-6 text-center border-t border-gray-100"
                >
                  <dt className="order-2 mt-2 text-lg font-medium leading-6 text-gray-500">
                    ETH/GBP
                  </dt>
                  <dd className="order-1 text-5xl font-extrabold text-gray-500">
                    £{unchangedGbpValue}
                    <span className={colorGbpClass}>{changedGbpValue}</span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
