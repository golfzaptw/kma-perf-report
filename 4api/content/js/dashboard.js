/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 90.59850067592478, "KoPercent": 9.401499324075212};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7076471672606611, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9341607862903226, 500, 1500, "LoginToLanding/Register.Service/UA/Register/AcceptTermAndCond"], "isController": false}, {"data": [0.9390811831340465, 500, 1500, "LoginToLanding/Main.Service/RegisterService.aspx - getcontenttermandcond"], "isController": false}, {"data": [0.8308167467398765, 500, 1500, "LoginToLanding/Main.Service/RegisterService.aspx - requestKey"], "isController": false}, {"data": [0.11293375394321767, 500, 1500, "LoginToLanding/Register.Service/UA/AuthenAuthorize/VerifyUserStatusForNewDevice"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 32548, 3060, 9.401499324075212, 4503.56743885952, 30, 30491, 56.0, 12128.0, 12426.0, 13494.980000000003, 53.37216376340331, 85.6988612675069, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["LoginToLanding/Register.Service/UA/Register/AcceptTermAndCond", 7936, 499, 6.287802419354839, 1589.2579385080662, 39, 30491, 59.0, 121.0, 24985.49999999999, 30079.0, 13.212991220753187, 16.281673858181783, 0.0], "isController": false}, {"data": ["LoginToLanding/Main.Service/RegisterService.aspx - getcontenttermandcond", 7945, 469, 5.903083700440528, 1683.738577721825, 30, 30348, 52.0, 116.0, 25502.899999999958, 30078.0, 13.225927812569708, 37.59925916024514, 0.0], "isController": false}, {"data": ["LoginToLanding/Main.Service/RegisterService.aspx - requestKey", 8742, 1252, 14.32166552276367, 4766.697323266994, 30, 30488, 36.0, 30022.0, 30025.0, 30090.0, 14.554329838207531, 13.805752668272994, 0.0], "isController": false}, {"data": ["LoginToLanding/Register.Service/UA/AuthenAuthorize/VerifyUserStatusForNewDevice", 7925, 840, 10.599369085173501, 9958.610851735019, 42, 30413, 11793.0, 13206.800000000001, 30023.0, 30085.0, 13.003741139406667, 19.040324801251966, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Failed to decrypt the response data", 726, 23.725490196078432, 2.2305518004178446], "isController": false}, {"data": ["504/Gateway Time-out", 1252, 40.91503267973856, 3.846626520830773], "isController": false}, {"data": ["500/Failed to decrypt the response data", 164, 5.359477124183006, 0.503871205604031], "isController": false}, {"data": ["504/Response is not a JSON object: null", 594, 19.41176470588235, 1.8249969276146], "isController": false}, {"data": ["Assertion failed", 324, 10.588235294117647, 0.9954528696079636], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 32548, 3060, "504/Gateway Time-out", 1252, "504/Failed to decrypt the response data", 726, "504/Response is not a JSON object: null", 594, "Assertion failed", 324, "500/Failed to decrypt the response data", 164], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["LoginToLanding/Register.Service/UA/Register/AcceptTermAndCond", 7936, 499, "504/Failed to decrypt the response data", 335, "500/Failed to decrypt the response data", 164, null, null, null, null, null, null], "isController": false}, {"data": ["LoginToLanding/Main.Service/RegisterService.aspx - getcontenttermandcond", 7945, 469, "504/Failed to decrypt the response data", 391, "Assertion failed", 78, null, null, null, null, null, null], "isController": false}, {"data": ["LoginToLanding/Main.Service/RegisterService.aspx - requestKey", 8742, 1252, "504/Gateway Time-out", 1252, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["LoginToLanding/Register.Service/UA/AuthenAuthorize/VerifyUserStatusForNewDevice", 7925, 840, "504/Response is not a JSON object: null", 594, "Assertion failed", 246, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
