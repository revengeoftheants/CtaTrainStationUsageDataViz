if (VizBuilder) {
	// This singleton object already exists.
} else {
	var VizBuilder = new function () {
		"use strict";

		// Declarations
		var Me = this,
		mStationsArray = [];


		/*
		Public Methods
		*/

		/* Loads the graphs into the page.
		*
		*/
		Me.Load = function () {

			//Load our data.
			loadData();
		};


		/*
		Private Methods
		*/

		/*
		* Retrieves and parses the JSON data, loading them into objects.
		*/
		var loadData = function () {

			//Perform an AJAX call to retrieve the JSON object and perform this
			//callback function.
			$.getJSON('http://localhost:8000/data/CtaTrainStationUsageDat.json', function (inpRidershipDatObj) {
				parseJSON(inpRidershipDatObj);

				calcAverages();

				loadPageElems();
			})
			.error(function() { alert("error"); });
		};


		/*
		* Parses the JSON data and loads them into objects.
		*/
		var parseJSON = function (inpRidershipDatObj) {

			var idx;

		    //The "data" array in the JSON object contains each data point individually.
		    for (idx = 0; idx < inpRidershipDatObj.data.length; idx += 1) {
				//Each data point contains an array of information about it (i.e., station ID, station name, date, count)
				var stationDayArray = inpRidershipDatObj.data[idx];
				var stationIdTxt = stationDayArray[8];

				//The date in the JSON file is a number in "epoch" format (milleseconds since 1970/1/1).
				var dateTxt = stationDayArray[10].toString();
				var thisDate = new Date(dateTxt * 1000)

				if (mStationsArray[stationIdTxt]) {
					//This station already exists in the array.
					mStationsArray[stationIdTxt].RiderCntByDate[dateTxt] = parseInt(stationDayArray[12]);
				} else {
					var stationNm = stationDayArray[9];
					mStationsArray[stationIdTxt] = new Station(stationIdTxt, stationNm);
					mStationsArray[stationIdTxt].RiderCntByDate[dateTxt] = parseInt(stationDayArray[12]);
				}
			}
		};


		/*
		* Cleanses the ridership data.
		*/
		var calcAverages = function () {

			var stationIdTxt = '';

			for (stationIdTxt in mStationsArray) {

				var thisStation = mStationsArray[stationIdTxt],
					currDateTxt = '',
					currDate = null,
					currYear = null,
					currRiderCnt = 0,
					oneYearTotRiderCnt = 0,
					oneYearDataPointsCnt = 0,
					oneYearAvgRiderCnt = 0,
					thisYearsCnts = null;

				for (currDateTxt in thisStation.RiderCntByDate) {
					currDate = new Date(parseInt(currDateTxt) * 1000);

					if (!currYear) {
						currYear = currDate.getFullYear();
					}

					if (currDate.getFullYear() === currYear) {
						currRiderCnt = thisStation.RiderCntByDate[currDateTxt];
						oneYearTotRiderCnt += currRiderCnt;
						oneYearDataPointsCnt += 1
					} else {
						oneYearAvgRiderCnt = Math.round(oneYearTotRiderCnt / oneYearDataPointsCnt);
						thisYearsCnts = new YearCnts(currYear, oneYearAvgRiderCnt)
						thisStation.AvgRiderCnts.push(thisYearsCnts);

						if (oneYearAvgRiderCnt < thisStation.LowestAvgRiderNbr || thisStation.LowestAvgRiderNbr === 0) {
							thisStation.LowestAvgRiderNbr = oneYearAvgRiderCnt;
						}

						if (oneYearAvgRiderCnt > thisStation.HighestAvgRiderNbr) {
							thisStation.HighestAvgRiderNbr = oneYearAvgRiderCnt;
						}

						//Start the count over.
						oneYearTotRiderCnt = thisStation.RiderCntByDate[currDateTxt];
						oneYearDataPointsCnt = 1;
						currYear = currDate.getFullYear();
					}

					if (currYear < thisStation.EarliestYear || thisStation.EarliestYear === 0) {
						thisStation.EarliestYear = currYear;
					}

					if (currYear > thisStation.LatestYear) {
						thisStation.LatestYear = currYear;
					}
				}

				//We have to get the average for the final year.
				oneYearAvgRiderCnt = Math.round(oneYearTotRiderCnt / oneYearDataPointsCnt);
				thisYearsCnts = new YearCnts(currYear, oneYearAvgRiderCnt)
				thisStation.AvgRiderCnts.push(thisYearsCnts);

				if (oneYearAvgRiderCnt < thisStation.LowestAvgRiderNbr || thisStation.LowestAvgRiderNbr === 0) {
					thisStation.LowestAvgRiderNbr = oneYearAvgRiderCnt;
				}

				if (oneYearAvgRiderCnt > thisStation.HighestAvgRiderNbr) {
					thisStation.HighestAvgRiderNbr = oneYearAvgRiderCnt;
				}
			}
		};


		/*
		* Populates the page with elements.
		*/
		var loadPageElems = function () {
		    
		    var stationCnt = 0,
		    stationIdTxt,
			currRowCntnr,
			rowNbr,
			colNbr,
			smallCntnrDivTxt,
			smallGraphCntnrWidthNbr = (window.innerWidth * .6) / 14,
			smallGraphCntnrHeightNbr = (window.innerHeight * .6) / 14;

				    
		    for (stationIdTxt in mStationsArray) {

				var thisStation = mStationsArray[stationIdTxt];

				//We're only going to add a graph if the station has existed since 2001.
				if (thisStation.AvgRiderCnts.length == 12) {

					stationCnt += 1;
	                rowNbr = Math.min(Math.ceil(stationCnt / 12), 12);
	                
					if (stationCnt === 1 || stationCnt % 12 === 1) {
						colNbr = 1;
						currRowCntnr = document.createElement("div");
						currRowCntnr.id = "rowCntnr" + rowNbr;
						currRowCntnr.className = "rowCntnr";
						$("#mainCntnr").append(currRowCntnr);
					} else {
						if (stationCnt < 12) {
							colNbr = stationCnt;
						} else {
							colNbr = stationCnt % 12;
							if (colNbr === 0) {
								colNbr = 12;
							}
						}
						currRowCntnr = $("#rowCntnr" + rowNbr)[0];
					}

					var stationCntnr = document.createElement("div");
					stationCntnr.id = "stationCntnr" + stationIdTxt;
					stationCntnr.className = "smallGraphCntnr col" + colNbr;
					currRowCntnr.appendChild(stationCntnr);

					//Create an svg element for this graph.
					var svgIdTxt = 'svgStation' + stationIdTxt;

					var svg = d3.select(stationCntnr).append("svg")
						.data(thisStation.AvgRiderCnts)
						.attr("id", svgIdTxt)
						.attr("class", "smallGraph col" + colNbr);

					var stationNmCntnr = document.createElement("span");
					stationNmCntnr.textContent = thisStation.Nm;
					stationNmCntnr.className = "smallGraphTxt col" + colNbr;
					stationCntnr.appendChild(stationNmCntnr);

					var lowerDomain = Math.max(thisStation.LowestAvgRiderNbr - Math.floor(thisStation.LowestAvgRiderNbr * .03), 0);
					var upperDomain = thisStation.HighestAvgRiderNbr + Math.ceil(thisStation.HighestAvgRiderNbr * .03);

					var xScale = d3.time.scale()
						.domain([new Date(thisStation.EarliestYear), new Date(thisStation.LatestYear)])
						.range([0, smallGraphCntnrWidthNbr]);
					var yScale = d3.time.scale()
						.domain([lowerDomain, upperDomain])
						.range([smallGraphCntnrHeightNbr, 0]);

					var line = d3.svg.line()
						.x(function(inpDatum) {return xScale(inpDatum.Year); })
						.y(function(inpDatum) {return yScale(inpDatum.AvgCnt); });

					//Display the line by appending an SVG path element with the data line we created.
					svg.append("path")
						.attr("class", "line")
						.attr("d", line(thisStation.AvgRiderCnts)); //We are calculating the path here.
				}
			}
		};
	};
}	