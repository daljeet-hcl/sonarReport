var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var csvwriter = require('csvwriter');
var csvReader = require('csvreader');

var url='localhost'; 
var componentRootsArr=[];
var rulesArr=[];
var comments=[]; 
 
function csvRecordHandler(data){
  comments.push(data[0]);
  rulesArr.push(data[1]);
}
function csvRecordHandler2(data){
  componentRootsArr.push(data[0]);
}
 
function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function evaluateComponent(componentRoot){
  function evaluateURL(acc,rule){	
   var responseText=httpGet('http://'+url+':9000/api/issues/search?rules='+rule+'&componentRoots='+componentRoot);
   var json=JSON.parse(responseText);    
    acc[rule] =json.total;
    return acc;
  }
 return rulesArr.reduce(evaluateURL,{'name':componentRoot});
}

csvReader
	.read("components.csv", csvRecordHandler2)
	.then(() => {
	csvReader
	  .read("rules.csv", csvRecordHandler)
	  .then(() => {
		 var finalResult=componentRootsArr.map(evaluateComponent);
		finalResult.unshift( rulesArr.reduce(function(acc,rule,index){
			  acc[rule]=comments[index];
			  return acc;} , {'name':'message'} ) );			  
		csvwriter(finalResult, function(err, csv) {
		  console.log(csv);
		});     		
	  })
})
  .catch(err => {
    console.error(err);
  });



