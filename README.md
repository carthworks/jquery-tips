# jquery-tips
A collection of basic tips and tricks to help up your jQuery . By Karthikeyan


<h3>Function get date difference </h3>

<pre>
function FnGetDateDifference(VarStartDate,VarEndDate){
	//Get 1 day in milliseconds
	var one_day=1000*60*60*24;
	// Convert both dates to milliseconds
	var date1_ms = new Date(VarStartDate).getTime();
	var date2_ms = new Date(VarEndDate).getTime();
	// Calculate the difference in milliseconds
	var difference_ms = date2_ms - date1_ms;
	// Convert back to days and return
	return Math.round(difference_ms/one_day); 
}</pre>

<a href="https://github.com/carthworks/jquery-tips/blob/master/Get%20difference%20between%20two%20dates">FnGetDateDifference</a>

<hr/>
<h3>Common function  </h3>
<pre>
function FnMakeAjaxRequest
function FnMakeAsyncAjaxRequest
function MakePostRequest
function MakeGetRequest
function MakeAsynPostRequest
function FnAjaxComplete
function FnAjaxComplete
function FnFormatTime
function timeConverter(UNIX_timestamp)
function FnDrawGridView(VarContainer,ArrDatasource,ArrColumns,ObjGridConfig)
function FnAssetGridExpand(e)
function FnResAssetGridExpand()
function FnGetComponentInstance(VarContainerId)
function FnDateProcess(VarFlag, VarDays)
function FnGetYearStartDate(VarYear)
function FnGetLastDay(VarYear, VarMonth)
function FnHandleTimeFormat(VarFullDate,VarFullTime,VarFlag)
function FnGetUniqueArray(Arr)
function FnGetDateDifference(VarStartDate,VarEndDate)
function FnExport(VarFileTitle,VarType)
function FnInitOnLoadGadget()


</pre>
<a href="https://github.com/carthworks/jquery-tips/blob/master/commonFunctions.js">Common functions</a>

