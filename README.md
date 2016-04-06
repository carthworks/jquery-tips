# Jquery-tips
A collection of basic tips and tricks to help up your jQuery . By Karthikeyan
<hr/>
<h3>Function check whether a value is a number </h3>

<pre>// Fn to check whether a value is a number in  jquery
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
</pre>
<h3>Function add a zero if input is single digit</h3>
// Fn to add a zero if input is single digig in  jquery
<pre>function FnAddZero(item){		
	return (item<10 ? "0"+item : item);	
}</pre>

<h3>Function to multiply </h3>
//Fn to get the name of the place from lat and long
<pre>function getPlaceName(lat,long){
  var VarLat=lat; var VarLong=long;
  var VarUrl='https://maps.googleapis.com/maps/api/geocode/json?latlng='+VarLat+','+VarLong+'&sensor=true';
  
$.ajax({ url:VarUrl,
         success: function(data){
        //   console.log(JSON.stringify(data));
             console.log(data.results[0].formatted_address);
             /*or you could iterate the components for only the city and state*/
 for (var i = 0; i < data.results[4].address_components.length; i++){               
 for (var j = 0; j < data.results[4].address_components[i].types.length; j++) {
              
      if(data.results[4].address_components[i].types[j] == 'country') {
          var country_code = data.results[4].address_components[i].short_name; 
        alert(country_code); } } }
           
         }
});}</pre>
  
Usage: 
getPlaceName(24.94,55.05);

<hr/>

<h3>Function to multiply </h3>
<pre>function multiply(a, b){
  if (!a || !b || typeof(a) != "number" || typeof(b) != "number") {
    return 0;
  }
  return a * b;
}</pre>


<hr/>

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

