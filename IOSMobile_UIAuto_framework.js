#import "../UI_repo/Include.js";
//#import "finder.js";
//#import "waiter.js";

// Eikon Mobile iOS automtaion framework
var target = UIATarget.localTarget();
var host = target.host();
var strRepoPath = "/Users/mani/Desktop/ios-automation/";
var curObj; 
var GlobalEnv = {};
var LocalVariables = {};
var DataVariables = [];
var curParentName;
var curObjectName;
var intRowCount;
var arrKeyword;
var intDataCount = 1;
var irow = 0;

function Keyword_Driver(strScriptLocation){
	GlobalEnv = {
    	DefaultMaxWaitingTime : 10,
    	EnableTableGroup : false,
    	ChildrenArrayCache : {},
    	Pass : true,
    	PassCount : 0,
    	FailCount : 0
	};
	
	var resultReadScript = host.performTaskWithPathArgumentsTimeout("/bin/cat", [strRepoPath+ strScriptLocation], 5);

	UIALogger.logStart("Script :" + strScriptLocation +  ": execution started");

	if(resultReadScript.exitCode == 0){

		var strKeywordCode = (resultReadScript.stdout).toString().replace(/(?:\/\*(?:[\s\S]*?)\*\/)/gm, '');

		arrKeyword = strKeywordCode.toString().replace(/(\r\n|\r|\n)/g, '\n').split("\n");

		intRowCount = arrKeyword.length;

		for(irow=0;irow<intRowCount;irow++){

			var arrCellData = arrKeyword[irow].split('||');


			if( (trim(arrCellData[0].toString()).indexOf('//') != 0) && ((trim(arrCellData[0].toString()))!="") ) {
				//target.delay(1);
				keyword(arrCellData);

			}

			else{

				if((arrCellData[0].toString().toLowerCase().indexOf('step info')) != -1){

					Log("StepInfo",(arrCellData[0].toString().replace('//Step Info:','')));

				}

				else {

					//Log("Skipped Line :" + (irow+1))

				}

			}

		}

		displayCurrentTestResults();
	}
	else{

		Log("warning", "File :"+ strScriptLocation  +"  : Doesnot exists " ,"Please check if the file exisits");

		Log("Fail",resultReadScript.stderr);
	}

}


function keyword(strStep){ 

	try {
	switch(trim(strStep[0].toString().toLowerCase()))
		{
			case "perform":
				func_perform (strStep[1],strStep[2],strStep[3]);
				break;

			case "check":
				func_check (strStep[1],strStep[2]);
				break;

			case "storevalue":
				func_storevalue (strStep[1].toString(),strStep[2]);
				break;

			case "logelementtree":
				eval(trim(strStep[1].toString())+".logElementTree()");
				break;

			case "waitfor":
				func_waitfor(strStep[1].toString(),strStep[2]);
				break;

			case "assignvalue":
				break;

			case "if":
				//Log("Debug","Start condition at " + (irow+1));
				func_condition(strStep[1]);
				break;

			case "endif":
				//Log("Debug","End condition at " + (irow+1));
				break;

			case "startloop":
				//Log("Debug","Start Loop at " + (irow+1));
				func_Loop(strStep[1]);
				break;

			case "endloop":
				//Log("Debug","End Loop at " + (irow+1));
				break;		
				
			case "log":
				 Log(ProcessData(strStep[1])) ;
				break;

			case "importdata":
				ImportData(ProcessData(strStep[1].toString()));
				break; 

			case "wait":
				target.delay(ProcessData(strStep[1]));
				break;

			case "type":
				target.delay(0.5);
				Log(ProcessData(strStep[1].toString()));
				switch(strStep[1].toString().toLowerCase())
					{

					case "go":
						target.frontMostApp().keyboard().typeString("\n");
						break;						
					default:
						target.frontMostApp().keyboard().typeString(ProcessData(strStep[1].toString()));						
						break;
					}
				break;  

			case "capturescreen":
				target.captureScreenWithName(ProcessData(strStep[1].toString()));
				break;

			case "setdeviceorientation":
				switch(strStep[1].toString().toLowerCase())
					{
					case "1":
					case "portrait":
						target.setDeviceOrientation(UIA_DEVICE_ORIENTATION_PORTRAIT);
						break;
					case "2":
					case "portrait_upsidedown":
						target.setDeviceOrientation(UIA_DEVICE_ORIENTATION_PORTRAIT_UPSIDEDOWN);
						break;
					case "3":
					case "landscape":
						target.setDeviceOrientation(UIA_DEVICE_ORIENTATION_LANDSCAPELEFT);
						break;
					case "4":
					case "landscape_right":
						target.setDeviceOrientation(UIA_DEVICE_ORIENTATION_LANDSCAPERIGHT);
						break;
					}
			  	
			    break;  

			default:
				Log("warning","Keyword :" + trim(strStep[0].toString()) +": not supported; Please refer to the keyword dictionary");
				break;
		}
	}

	catch(e){
		Log("fail",e.message + " at Row number " + irow );
	}

};


function func_perform(strObj,strAction,strArg){

	if (strObj.indexOf(';')) {

	}
	else{

	}
	func_ObjectSet(strObj);
	if (curObj.isValid()) {
		var arrAction = strAction.split(':');
		switch(arrAction[0].toString().toLowerCase())
			{

				case "tap":
					curObj.tap();
					break;

				case "type":
					curObj.tap();
					target.delay(0.5);
					target.frontMostApp().keyboard().typeString(ProcessData(arrAction[1].toString()));
					break;

				case "longtap":
					curObj.tapWithOptions({duration:ProcessData(arrAction[1])});
					break;

				case "tapoffset":
					curObj.tapWithOptions({tapOffset:{x:ProcessData(arrAction[1]), y:ProcessData(arrAction[2])}});
					break;

				case "scrolltovisible":
					curObj.scrollToVisible();
					break;
					

			  	default:
			  		Log("warning","Action " + arrAction[0] +": not supported; Please refer to the keyword dictionary");
			    	break;
			}
	}
	else {
			Log("fail","UI Element {" + (strObj.toString().split(";"))[1] + "} Doesnot exist. ");
	}

}

function func_check(strObj,strCheck,strArgs){
func_ObjectSet(strObj);
var arrObj = strObj.toString().split(";");
arrObj[1] = ProcessData(arrObj[1].toString());

var arrCheck = strCheck.split(':');
switch(arrCheck[0].toString().toLowerCase())
{
  case "visible":
  	Waiter.waitForElementVisible(curObj,20);
  	if(curObj.isVisible()){
  		Log("Pass", "UI Element " +arrObj+ " is visible which is as expected")
  	}
  	else{
  		Log("Fail","UI Element " +arrObj+ " is not visible which is not as expected")

  	}
    break;

  case "invisible":
  	Waiter.waitForElementInvisible(curObj);
  	if(!(curObj.isVisible())) {
  		Log("Pass", "UI Element " +arrObj+ " is not visible which is as expected")
  	}
  	else{
  		Log("Fail","UI Element " +arrObj+ " is visible which is not as expected")

  	}
    break;

  case "enabled":
  	if(curObj.isEnabled()){
  		Log("Pass", "UI Element " +arrObj+ " is enabled which is as expected")
  	}
  	else{
  		Log("Fail","UI Element " +arrObj+ " is  disabled which is not as expected")

  	}    
    break;

  case "disabled":
  	if(!(curObj.isEnabled())){
  		Log("Pass", "UI Element " +arrObj+ " is disabled which is as expected")
  	}
  	else{
  		Log("Fail","UI Element " +arrObj+ " is enabled which is not as expected")

  	}    
    break;

  case "value":
  	var strValue = curObj.value();
	if(strValue == ProcessData(arrCheck[1].toString())){
  		Log("Pass", "UI Element " +arrObj+ "'s value is  " + strValue + " which is as expected")
  	}
  	else{
  		Log("Fail","UI Element " +arrObj+ "'s value is  " + strValue + " which is not " + ProcessData(arrCheck[1].toString()) + "as expected")

  	}    
  	break;

  default:
  	Log("warning","Check for the Property " + arrCheck[0] +" is not supported; Please refer to the keyword dictionary");
    break;
}


}

function func_storevalue(strObj,strStore,strArgs){
func_ObjectSet(strObj);
var strVal= new String();
var arrStore = strStore.split(':');
switch(arrStore[0].toString().toLowerCase())
{
  case "visible":
  	if(curObj.isVisible()){
  		strVal = true;
  	}
  	else{
  		strVal = false;
  	}
    break;
  case "enabled":
  	strVal = curObj.isEnabled();
    break;
  case "valid":
  	strVal = curObj.isValid();
    break;
  case "label":
  	strVal = curObj.label();
    break;
  case "name":
  	strVal = curObj.name();
    break;
  case "value":
  	strVal = curObj.value();
    break;
  default:
  	Log("warning","Keyword " + arrStore[0] +" not supported")
    break;
}

SetValue(arrStore[1],strVal);

}

function SetValue(strVar,strVal){
	LocalVariables[strVar] = strVal;
}

function GetValue(strVar){
	return LocalVariables[strVar];
}

function ProcessData(strData){
	if (strData.toString().indexOf('@')==0) {
		return (GetValue(strData.toString().replace('@','')));
	}
	else if(strData.toString().toLowerCase() == "blank") {
		return "";
	} 
	else if(strData.toString().indexOf('dt_') == 0) {
		for (var i = 0; i < DataVariables[0].length; i++) {
			if((DataVariables[0][i]).toString().toLowerCase() == ((strData.toString().split('_'))[1]).toString().toLowerCase()) {
				return DataVariables[intDataCount][i].toString();
				break;
			}

		};
		return "";
	} 
	else { 
		return (strData)
	};
}

function func_condition(strCondition){
var boolConditionFlag = false;
var arrCondition = strCondition.split(';');
for(var i=0;i<arrCondition.length;i++){
arrCondition[i] = ProcessData(arrCondition[i]);	
}

switch(trim(arrCondition[1].toString().toLowerCase()))
	{
		case "==":
		case "equals":
			if(arrCondition[0].toString().toLowerCase() == arrCondition[2].toString().toLowerCase()) {
				boolConditionFlag = true;
			}

			break;

		case "not":
			if(arrCondition[0].toString().toLowerCase() != arrCondition[2].toString().toLowerCase()) {
				boolConditionFlag = true;
			}

			break;

		case "greaterthan":
			if(arrCondition[0] > arrCondition[2]) {
				boolConditionFlag = true;
			}
			break;

		case "lessthan":
			if(arrCondition[0] < arrCondition[2]) {
				boolConditionFlag = true;
			}
			break;						
	}

if(!(boolConditionFlag)){
var endRow = getRowEnd(irow,'endif');
Log("Debug", "Condition not satisfied; Skipping rows from :" + (irow+1) + " to " + (endRow+1) )
irow = endRow;
}

}


function getRowEnd(iRow,strType){
var iFalg = false;
	for(var iCurRow=iRow;iCurRow<intRowCount;iCurRow++){
		var arrCellData = arrKeyword[iCurRow].split(','); 
		if( (arrCellData[0].toString().toLowerCase().indexOf('//') != 0) ){				
			if(trim(arrCellData[0].toString().toLowerCase()) == strType.toLowerCase()) {
				iFalg = true;
				break;
			}
		}
	}
	if (iFalg) { return iCurRow;}
	else { Log ("Warning","End statement not found. Please close the Loop/Condition at : " + (iRow+1))
		return iRow;
	}

}


function func_Loop(iLoopCount){

	var boolDataIterate = false;



	var startLoop = irow+1;
	var endLoop = getRowEnd(irow,'endloop')
	
	if(endLoop > startLoop ) {

		if(!(iLoopCount)){
			iLoopCount = (DataVariables.length-1)
			boolDataIterate = true;
			Log("Iteration","****** Start of Iteration for rows between ["+ startLoop + " & " + endLoop +"] based on test data set (" + iLoopCount + " times) ******")
		}
		else {
			Log("Iteration","****** Start of Iteration for rows between ["+ startLoop + " & " + endLoop +"] for (" + iLoopCount + " times) for same set of data ******")
		}

		for (var iLoop = 0; iLoop < iLoopCount; iLoop++) {

			if (boolDataIterate) {
				intDataCount = iLoop+1;
			}

			for (irow = startLoop; irow < endLoop; irow++) {

				var arrCellData = arrKeyword[irow].split('||');

				if( (trim(arrCellData[0].toString()).indexOf('//') != 0) && ((trim(arrCellData[0].toString()))!="") ) {
					//target.delay(0.5);
					keyword(arrCellData);
				}

				else{

					if(arrCellData[0].toString().toLowerCase().indexOf('step info') != -1){

						Log("StepInfo",(arrCellData[0].toString().replace('//Step Info:','')));

					}

					else {

						Log("Skipped Line :" + (irow+1))

					}

			}

			};

		irow = endLoop;

		};

		Log("Iteration","****** End of Iteration for rows between ["+ startLoop + " & " + endLoop +"]  ******")

	}

	else {

		Log ("Warning","EndLoop not found. Please close the Loop at  " + (irow+1))

	}

}


// Function Name: func_ObjectSet
// Function Description:  
// Argumetns:
// Return Value: 

function func_ObjectSet(strObj){
var arrObj = strObj.toString().split(";");
arrObj[1] = ProcessData(arrObj[1].toString());
switch(trim(arrObj[0].toString().toLowerCase()))
	{
		case "login":
			curObj = GetLoginObjects(arrObj[1]);
			break;
		case "dashboard":
			curObj = GetDashBoardObjects(arrObj[1]);
			break;
		case "menu":
			curObj = GetMenuObjects(arrObj[1]);
			break;
		case "navigation":
			curObj = GetNavigationObjects(arrObj[1]);
			break;
		case "search":
			curObj = GetSearchObjects(arrObj[1]);
			break;
		case "markets":
			curObj = GetMarketsObjects(arrObj[1]);
			break;
		case "about":
			curObj = GetAboutObjects(arrObj[1]);
			break;
		case "preferences":
			curObj = GetPreferencesObjects(arrObj[1]);
			break;
		case "lists":
			curObj = GetListObjects(arrObj[1]);
			break;
		case "news":
			curObj = GetNewsObjects(arrObj[1]);
			break;
		case "byname":
			curObj = Finder.findElementByName(arrObj[1]);
			
	}
}

function Log(strStatus,strMsg){

	switch(strStatus.toString().toLowerCase())
	{
		case "pass":
			UIALogger.logMessage("PASS - " + strMsg );
			GlobalEnv.PassCount = GlobalEnv.PassCount + 1;
			break;
		case "fail":
			UIALogger.logError("FAIL - " + strMsg);
			GlobalEnv.FailCount = GlobalEnv.FailCount + 1;
			break;
		case "warning":
			UIALogger.logWarning("Warning - " + strMsg );
			break;
		case "debug":
			UIALogger.logDebug("● Debug - " + strMsg );
			break;
		case "stepinfo":
			UIALogger.logMessage("⚑ Step ➜ " + strMsg );
			break;
		case "iteration":
			UIALogger.logMessage("ƒ Iteration ➜ " + strMsg );
			break;	
		default:
			UIALogger.logDebug("● Debug - " + strStatus );
		break;
	}
	
}


function func_waitfor(strObj,strWaitfor){
	func_ObjectSet(strObj);
	var arrWaitfor = strWaitfor.toString().split(":");
	switch(arrWaitfor[0].toString().toLowerCase()){
		case "invalid":
			target.pushTimeout(arrWaitfor[1]);
			curObj.waitForInvalid();
			target.popTimeout();
			break;
		case "visible":
			Waiter.waitForElementVisible(curObj,arrWaitfor[1])
			break;
		case "invisible":
			Waiter.waitForElementInvisible(curObj,arrWaitfor[1])
			break;
	}
	
}


function trim(str) {
        return str.replace(/^\s+|\s+$/g,"");
}


function displayCurrentTestResults() {
    if (GlobalEnv.FailCount == 0) {
        UIALogger.logPass(" 😄 " +  GlobalEnv.PassCount + "/" + (GlobalEnv.PassCount+GlobalEnv.FailCount) +" Steps Passed 😄 ");
    }
    else {
         UIALogger.logFail(" 😡 " +  GlobalEnv.FailCount + "/" + (GlobalEnv.PassCount+GlobalEnv.FailCount) +" Steps failed! 😡 ");
    }
}





/*

function waitForElement(target, maxTime) {
    var window = win();
    var child = findChild(window, target);
    var timeStarted = currentTimeInSec();
    var timeSpent = 0;
    while(!child && timeSpent<maxTime) {
        wait(1);
        child = findChild(window, target);
        timeSpent = currentTimeInSec() - timeStarted;
    }
    return child;
}
*/

/// Current time in seconds
function currentTimeInSec() {
    return (new Date().getTime() / 1000);
}






function ImportData(strDataFile) {
	DataVariables = [];
	var resultReadScript = host.performTaskWithPathArgumentsTimeout("/bin/cat", [strRepoPath+ 'data/' + strDataFile], 5);
	if(resultReadScript.exitCode == 0){
		var arrData = canonicalizeNewlines((resultReadScript.stdout).toString()).split("\n");
		for(var i=0; i<arrData.length; i++) {
	    	DataVariables.push(arrData[i].split(','));
		}
	}
}



/// Find an element whose name contains str within element.
/// If allowCache is true, it might re-use the result at any level during the last childrenArray calls
function findChild(element, str, allowCache) {
    var splitIdx = str.indexOf("::");
    if (splitIdx>=0) {
        var items = str.split("::");
        var first = findChild(element, items[0], allowCache);
        if (!first) return null;
        return findChild(first, str.substring(splitIdx+2), allowCache);
    }

    var realtype = null;
    var realstr = str;

    var reg = /^\(\((.*)\)\)(.*)/;
    var rmatch = reg.exec(str);
    if (rmatch) {
        realtype = rmatch[1];
        realstr = rmatch[2];
    }

    var skipCount = 0;
    var reg2 = /(.*)\[\[(\d+)\]\]$/;
    var rmatch2 = reg2.exec(realstr);
    if (rmatch2) {
        realstr = rmatch2[1];
        skipCount = parseInt(rmatch2[2]);
    }

    var array = childrenArray(element, allowCache);
    for (var i in array) {
        var element = array[i];
        if (!inScreen(element)) {
            continue;
        }
        var match = true;
        if (realstr.length) {
            if (!element.name()) {
                match = false;
            }
            else if (element.name().indexOf(realstr)<0) {
                match = false;
            }
        }
        if (realtype) {
            var info = " "+element;
            if (info.indexOf(realtype)<0) {
                match = false;
            }
        }
        if (match) {
            if (skipCount>0) {
                skipCount --;
            }
            else {
                return element;
            }
        }
    }
    return null;
}



/** Get an array of children for an element.
 * if allowCache is true, it might return the result from last childrenArray call
*/
function childrenArray(element, allowCache) {
    var elementText = debugText(element);
    if (allowCache) {
        var cachedArray = GlobalEnv.ChildrenArrayCache[elementText];
        if (cachedArray) {
            return cachedArray;
        }
    }
    var children = (element instanceof UIATableView)? element.visibleCells() : element.elements();
    var array = children.toArray();
    if (GlobalEnv.EnableTableGroup && (element instanceof UIATableView)) {
        var groups = element.groups(); // this call takes 5 sec for tables without groups..
        if (groups) {
            array = array.concat(groups.toArray());
        }
    }
    if (!array) {
        array = []; // at least make it an object so we can cache
    }
    GlobalEnv.ChildrenArrayCache[elementText] = array;
    return array;
} 




function canonicalizeNewlines(str){
  return str.replace(/(\r\n|\r|\n)/g, '\n');
};





var Finder = {

        findTableCell: function (tableName,index){
                Waiter.wait(1);
                if (!index) {
                        index = 0;
                }
                var tableView = this.findElementByName(tableName);
                var tableCell = tableView.cells()[index];
                tableView.scrollToElementWithName(tableCell.name());
                return tableCell;
        },
        
        findListChild : function(tableName, item, group) {
                Waiter.wait(1);
                var table = this.findElement_By_name(tableName);
                var grp;
                if (item < 0) {
                        grp = table.groups()[group];
                } else if ((group == null) && (item >= 0)) {
                        grp = table.cells()[item];
                } else {
                        grp = table.groups()[group].cells()[item];
                }
                table.scrollToElementWithName(grp.name());
                return grp;
        },


        
        findElementByType : function(type,index,parent){
                Waiter.wait(1);
                var start = (new Date()).getTime();
                if (!parent) {
                        parent = UIATarget.localTarget().frontMostApp().mainWindow();
                }
                if (!index) {
                        index = 0;
                }
                var timeout = UIATarget.localTarget().timeout();
                var result;
                while (((new Date()).getTime() - start) < (timeout * 1000)
                                || timeout == 0) {
                        if(type == "UIAScrollView"){
                                result = parent.scrollViews()[index];
                        }else if(type == "UIAStaticText"){
                                result = parent.staticTexts()[index];
                        }else if(type == "UIAButton"){
                                result = parent.buttons()[index];
                        }else if(type == "UIATextField"){
                                result = parent.textFields()[index];
                        }else if(type == "UIASecureTextField"){
                                result = parent.secureTextFields()[index];
                        }
                        if (!isNil(result)) {
                                if (!inScreen(result)) {
                                        result.scrollToVisible();
                                }
                                return result;
                        }
                }
                return result;
        },
        
        findElementByName : function(name, parent) {
                Waiter.wait(1);
                var start = (new Date()).getTime();
                if (!parent) {
                        parent = UIATarget.localTarget().frontMostApp();
                }
                var timeout = UIATarget.localTarget().timeout();
                var result;
                while (((new Date()).getTime() - start) < (timeout * 1000)
                                || timeout == 0) {
                        result = this._searchElements(parent, name, "name");
                        if (!isNil(result)) {
                            Log(result);
                                if (!inScreen(result)) {
                                        result.scrollToVisible();
                                }
                                return result;
                        }
                }
                return result;
        },

        findElementByValue : function(value, parent) {
                Waiter.wait(1);
                var start = (new Date()).getTime();
                if (!parent) {
                        parent = UIATarget.localTarget().frontMostApp();
                }
                var timeout = UIATarget.localTarget().timeout();

                var result;
                while (((new Date()).getTime() - start) < (timeout * 1000)
                                || timeout == 0) {
                        result = this._searchElements(parent, value, "value");
                        if (result.isValid()) {
                                UIATarget.localTarget().delay(0.5);
                                return result;
                        }
                }
                // UIALogger.logFail("Unable to find element named " + name);
                // Assert.fail("Unable to find element value " + value);
                return result;
        },

        isNil : function(element) {
                return (element.toString() == "[object UIAElementNil]");
        },


        scrollToAndGet : function(tableName, item, group) {
                var table = Finder.findElement_By_name(tableName);
                var grp;
                if (item < 0) {
                        grp = table.groups()[group];
                } else if ((group == null) && (item >= 0)) {
                        grp = table.cells()[item];
                } else {
                        grp = table.groups()[group].cells()[item];
                }
                table.scrollToElementWithName(grp.name());
                return grp;
        },

        _searchElements : function(elem, value, key) {
                try {
                       	UIATarget.localTarget().pushTimeout(0);
                      	var result = elem.withValueForKey(value, key);
                        if (!isNil(result)) {
                                return result;
                        }

                        var elems = elem.elements();
                        var i;
                        for (i = 0; i < elems.length; i++) {
                                var child = elems[i];
                                result = this._searchElements(child, value, key);
                                if (!isNil(result)) {
                                        return result;
                                }
                        }
                        return result;
                } 
                finally {
                        UIATarget.localTarget().popTimeout();
                }
        },
}

function isNil(element) {
        return (element.toString() == "[object UIAElementNil]");
}

function inScreen(ele){
    var target = UIATarget.localTarget();
    var app = target.frontMostApp();
    var origin_x = app.rect().origin.x;
    var origin_y = app.rect().origin.y;
    var width = app.rect().size.width;
    var height = app.rect().size.height;

    var hitpointx = getElement_originx(ele)+getElement_width(ele)/2;
   
    var hitpointy = getElement_originy(ele)+getElement_height(ele)/2;
    
    if( ( hitpointx > origin_x )&&( hitpointx < (origin_x+width) ) ){
        if( ( hitpointy > origin_y )&&( hitpointy < (origin_y+height) ) ){
            return true;
        }
    }
    return false;
}

function getElement_originx(ele){
    return ele.rect().origin.x;
}

function getElement_originy(ele){
    return ele.rect().origin.y;
}

function getElement_width(ele){
    return ele.rect().size.width;
}

function getElement_height(ele){
    return ele.rect().size.height;
}

function getElement_hitpointx(ele){
    return ele.hitpoint().x;
}

function getElement_hitpointy(ele){
    return ele.hitpoint().y;
}


var Waiter = {
        TIMEOUT : 20,// 20 seconds
        SMALL_TIMEOUT : 10, // 10 seconds
        /**
         * wait seconds
         * 
         * @param seconds -
         *            wait time
         */
        wait : function(seconds) {
                UIATarget.localTarget().delay(seconds);
        },

        /**
         * Poll till the item becomes visible, up to a specified timeout
         */
        waitForElementVisible : function(element, timeoutInSeconds) {
                try {
                        UIATarget.localTarget().pushTimeout(0);
                        var delay = 0.25;
                        var i = 1;
                        if(!timeoutInSeconds){
                                timeoutInSeconds = this.SMALL_TIMEOUT;
                        }
                        while (timeoutInSeconds - i * delay >= 0) {
//                                UIALogger.logMessage("waitForElementVisible ===" + i);
                                if (element.isVisible())
                                        return true;
                                i++;
                                this.wait(delay);
                        }
                        return false;
                } finally {
                        UIATarget.localTarget().popTimeout();
                }
        },

        /**
         * Wait until element becomes invisible
         */
        waitForElementInvisible : function(element, timeoutInSeconds) {
                try {
                        UIATarget.localTarget().pushTimeout(0);
                        var delay = 0.25;
                        var i = 1;
                        if(!timeoutInSeconds){
                                timeoutInSeconds = this.SMALL_TIMEOUT;
                        }
                        while (timeoutInSeconds - i * delay >= 0) {
                                if (!element.isVisible())
                                        return true;
                                i++;
                                this.wait(delay);
                        }
                        return false;
                } finally {
                        UIATarget.localTarget().popTimeout();
                }
        },

}






