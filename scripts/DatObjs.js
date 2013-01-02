function Station (inpIdTxt, inpNm) {
	this.IdTxt = inpIdTxt;
	this.Nm = inpNm;
	this.RiderCntByDate = new Array(); //We have daily data from 1/1/01 to 10/31/12.
	this.AvgRiderCnts = new Array();
	this.LowestAvgRiderNbr = 0;
	this.HighestAvgRiderNbr = 0;
	this.EarliestYear = 0;
	this.LatestYear = 0;
}

function YearCnts (inpYearVal, inpAvgCnt) {
	this.Year = inpYearVal;
	this.AvgCnt = inpAvgCnt;
}

function Month (inpVal) {
	this.Val = inpVal;
	this.Days; //We don't instantiate an Array here because the length will be particular to the month.
}

function Day (inpVal, inpEntryCnt) {
	this.Val = inpVal;
	this.EntryCnt = inpEntryCnt;
}