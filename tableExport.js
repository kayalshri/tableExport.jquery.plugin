/*The MIT License (MIT)

Copyright (c) 2014 https://github.com/kayalshri/

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.*/

(function($){
        $.fn.extend({
            tableExport: function(options) {
                var defaults = {
						csvSeparator: ',',
						csvEnclosure: '"',
						onCellData: null,
						ignoreColumn: [],
						theadSelector:'tr',
						tableName:'yourTableName',
						type:'csv',
						pdfFontSize:14,
						pdfLeftMargin:20,
						escape:'true',
						htmlContent:'false',
						consoleLog:'false',
						outputMode:'file',  // file|string|base64
						fileName:'exportData'
				};
                
				var options = $.extend(defaults, options);
				var el = this;
				var DownloadEvt = null;
				
				if(defaults.type == 'csv' || defaults.type == 'txt'){
				
					// Header
					var tdData ="";
					var rowIndex = 0;
					$(el).find('thead').find(defaults.theadSelector).each(function() {
					tdData += "\n";
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += csvString(this, rowIndex, index) + defaults.csvSeparator;
								}
							}
							
						});
						rowIndex++;
						tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					
					// Row vs Column
					$(el).find('tbody').find('tr').each(function() {
					tdData += "\n";
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += csvString(this, rowIndex, index) + defaults.csvSeparator;
								}
							}
						});
						rowIndex++;
						//tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					
					//output
					if(defaults.consoleLog == 'true')
						console.log(tdData);

					if(defaults.outputMode == 'string')
						return tdData;

					var base64data = $.base64.encode(tdData);

					if(defaults.outputMode == 'base64')
						return base64data;

					downloadFile(defaults.fileName+'.csv', 'data:text/csv;charset=utf-8;base64,' + base64data);
					
				}else if(defaults.type == 'sql'){
				
					// Header
					var tdData ="INSERT INTO `"+defaults.tableName+"` (";
					$(el).find('thead').find(defaults.theadSelector).each(function() {
					
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '`' + parseString(this, rowIndex, index) + '`,' ;
								}
							}
							
						});
						rowIndex++;
						tdData = $.trim(tdData);
						tdData = $.trim(tdData).substring(0, tdData.length -1);
					});
					tdData += ") VALUES ";
					// Row vs Column
					$(el).find('tbody').find('tr').each(function() {
					tdData += "(";
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									tdData += '"' + parseString(this, rowIndex, index) + '",';
								}
							}
						});
						rowIndex++;
						tdData = $.trim(tdData).substring(0, tdData.length -1);
						tdData += "),";
					});

					tdData = $.trim(tdData).substring(0, tdData.length -1);
					tdData += ";";
					
					//output
					if(defaults.consoleLog == 'true')
						console.log(tdData);
					
					if(defaults.outputMode == 'string')
						return tdData;

					var base64data = $.base64.encode(tdData);

					if(defaults.outputMode == 'base64')
						return base64data;

					downloadFile(defaults.fileName+'.sql', 'data:application/sql;charset=utf-8;base64,' + base64data);
					
				}else if(defaults.type == 'json'){
				
					var jsonHeaderArray = [];
					$(el).find('thead').find(defaults.theadSelector).each(function() {
						var tdData ="";	
						var jsonArrayTd = [];
						var rowIndex = 0;
					
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									jsonArrayTd.push(parseString(this, rowIndex, index));
								}
							}
						});
						rowIndex++;
						jsonHeaderArray.push(jsonArrayTd);
						
					});
					
					var jsonArray = [];
					$(el).find('tbody').find('tr').each(function() {
						var tdData ="";	
						var jsonArrayTd = [];
					
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									jsonArrayTd.push(parseString(this, rowIndex, index));
								}
							}
						});
						rowIndex++;
						jsonArray.push(jsonArrayTd);
					});
					
					var jsonExportArray =[];
					jsonExportArray.push({header:jsonHeaderArray,data:jsonArray});
					
					if(defaults.consoleLog == 'true')
					console.log(JSON.stringify(jsonExportArray));

					if(defaults.outputMode == 'string')
						return JSON.stringify(jsonExportArray);

					var base64data = $.base64.encode(JSON.stringify(jsonExportArray));

					if(defaults.outputMode == 'base64')
						return base64data;

					downloadFile(defaults.fileName+'.json', 'data:application/json;charset=utf-8;base64,' + base64data);
					
				}else if(defaults.type == 'xml'){

					var rowIndex = 0;
					var xml = '<?xml version="1.0" encoding="utf-8"?>';
					xml += '<tabledata><fields>';

					// Header
					$(el).find('thead').find(defaults.theadSelector).each(function() {
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									xml += "<field>" + parseString(this, rowIndex, index) + "</field>";
								}
							}
						});
						rowIndex++;
					});
					xml += '</fields><data>';
					
					// Row Vs Column
					var rowCount=1;
					$(el).find('tbody').find('tr').each(function() {
						xml += '<row id="'+rowCount+'">';
						var colCount=0;
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){	
								if(defaults.ignoreColumn.indexOf(index) == -1){
									xml += "<column-"+colCount+">"+parseString(this, rowIndex, index)+"</column-"+colCount+">";
								}
							}
							colCount++;
						});
						rowCount++;
						rowIndex++;
						xml += '</row>';
					});
					xml += '</data></tabledata>'
					
					//output
					if(defaults.consoleLog == 'true')
						console.log(xml);

					if(defaults.outputMode == 'string')
						return xml;

					var base64data = $.base64.encode(xml);

					if(defaults.outputMode == 'base64')
					return base64data;

					downloadFile(defaults.fileName+'.xml', 'data:application/xml;charset=utf-8;base64,' + base64data);
					
				}else if(defaults.type == 'excel' || defaults.type == 'doc'|| defaults.type == 'powerpoint'  ){
					//console.log($(this).html());
					
					var rowIndex = 0;
					var excel="<table>";
					// Header
					$(el).find('thead').find(defaults.theadSelector).each(function() {
						excel += "<tr>";
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									excel += "<td>" + parseString(this, rowIndex, index)+ "</td>";
								}
							}
						});
						rowIndex++;
						excel += '</tr>';
					});

					// Row Vs Column
					var rowCount=1;
					$(el).find('tbody').find('tr').each(function() {
						excel += "<tr>";
						var colCount=0;
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									excel += "<td>"+parseString(this, rowIndex, index)+"</td>";
								}
							}
							colCount++;
						});
						rowCount++;
						rowIndex++;
						excel += '</tr>';
					});
					excel += '</table>'
					
					if(defaults.consoleLog == 'true')
						console.log(excel);
					
					var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:"+defaults.type+"' xmlns='http://www.w3.org/TR/REC-html40'>";
					excelFile += "<head>";
					excelFile += "<!--[if gte mso 9]>";
					excelFile += "<xml>";
					excelFile += "<x:ExcelWorkbook>";
					excelFile += "<x:ExcelWorksheets>";
					excelFile += "<x:ExcelWorksheet>";
					excelFile += "<x:Name>";
					excelFile += "{worksheet}";
					excelFile += "</x:Name>";
					excelFile += "<x:WorksheetOptions>";
					excelFile += "<x:DisplayGridlines/>";
					excelFile += "</x:WorksheetOptions>";
					excelFile += "</x:ExcelWorksheet>";
					excelFile += "</x:ExcelWorksheets>";
					excelFile += "</x:ExcelWorkbook>";
					excelFile += "</xml>";
					excelFile += "<![endif]-->";
					excelFile += "</head>";
					excelFile += "<body>";
					excelFile += excel;
					excelFile += "</body>";
					excelFile += "</html>";

					if(defaults.outputMode == 'string')
						return excelFile;

					var base64data = $.base64.encode(excelFile);

					if(defaults.outputMode == 'base64')
						return base64data;

					var extension = (defaults.type == 'excel')? 'xls' : (defaults.type == 'doc')? 'doc' : 'ppt';
					downloadFile(defaults.fileName+'.'+extension, 'data:application/vnd.ms-'+defaults.type+';base64,' + base64data);

				}else if(defaults.type == 'png'){
					html2canvas($(el), {
						onrendered: function(canvas) {
							var img = canvas.toDataURL("image/png");
							window.open(img);
						}
					});
				}else if(defaults.type == 'pdf'){

					var rowIndex = 0;
					var doc = new jsPDF('p','pt', 'a4', true);
					doc.setFontSize(defaults.pdfFontSize);

					// Header
					var startColPosition=defaults.pdfLeftMargin;
					$(el).find('thead').find(defaults.theadSelector).each(function() {
						$(this).filter(':visible').find('th').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									var colPosition = startColPosition+ (index * 50);
									doc.text(colPosition,20, parseString(this, rowIndex, index));
								}
							}
						});
						rowIndex++;
					});

					// Row Vs Column
					var startRowPosition = 20; var page =1;var rowPosition=0;
					$(el).find('tbody').find('tr').each(function(index,data) {
						rowCalc = index+1;

					if (rowCalc % 26 == 0){
						doc.addPage();
						page++;
						startRowPosition=startRowPosition+10;
					}
					rowPosition=(startRowPosition + (rowCalc * 10)) - ((page -1) * 280);
						
						$(this).filter(':visible').find('td').each(function(index,data) {
							if ($(this).css('display') != 'none'){
								if(defaults.ignoreColumn.indexOf(index) == -1){
									var colPosition = startColPosition+ (index * 50);
									doc.text(colPosition,rowPosition, parseString(this, rowIndex, index));
								}
							}

						});
						rowIndex++;
					});

					// Output as Data URI
					doc.output('datauri');

				}


				function escapeRegExp(string){
					return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
				}

				function replaceAll(string, find, replace){
					return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
				}

				function csvString(cell, rowIndex, colIndex){
					var result = '';
					var dataString = parseString(cell, rowIndex, colIndex);

					var csvValue = (dataString === null || dataString == '')? '' : dataString.toString();

					if ( dataString instanceof Date )
						csvValue = defaults.csvEnclosure + dataString.toLocaleString() + defaults.csvEnclosure;

					var result = replaceAll (csvValue, defaults.csvEnclosure, defaults.csvEnclosure + defaults.csvEnclosure);

					if ( result.indexOf (defaults.csvSeparator) >= 0 || result.indexOf (' ') >= 0 )
						result = defaults.csvEnclosure + result + defaults.csvEnclosure;

					return result;
				}

				function parseString(cell, rowIndex, colIndex){
					var $cell = $(cell);

					if(defaults.htmlContent == 'true'){
						content_data = $cell.html().trim();
					}else{
						content_data = $cell.text().trim().replace(/\u00AD/g, ""); // remove soft hyphens
					}
					
					if(defaults.escape == 'true'){
						content_data = escape(content_data);
					}
					
					if (typeof defaults.onCellData === 'function'){
						content_data = defaults.onCellData($cell, rowIndex, colIndex, content_data);
					}
					
					return content_data;
				}

				function downloadFile(filename, data){
					var DownloadLink = document.createElement('a');

					if ( DownloadLink ){
						DownloadLink.style = 'display: none';
						DownloadLink.download = filename;
						DownloadLink.href = data;

						if ( document.createEvent ){
							if ( DownloadEvt == null )
								DownloadEvt = document.createEvent('MouseEvents');

							DownloadEvt.initEvent('click', true, false);
							DownloadLink.dispatchEvent(DownloadEvt);
						}
						else if ( document.createEventObject )
							DownloadLink.fireEvent('onclick');
						else if (typeof DownloadLink.onclick == 'function' )
							DownloadLink.onclick();
						
						document.body.removeChild(DownloadLink);
					}
				}
			}
		});
})(jQuery);

