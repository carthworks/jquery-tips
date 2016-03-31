# jquery-tips
A collection of basic tips and tricks to help up your jQuery . By Karthikeyan


<h3>Function get date difference </h3>

<p>
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
}</p>

<a href="https://github.com/carthworks/jquery-tips/blob/master/Get%20difference%20between%20two%20dates">FnGetDateDifference</a>

<hr/>
<h3>Common function  </h3>
<a href="https://github.com/carthworks/jquery-tips/blob/master/commonFunctions.js">Common functions</a>

