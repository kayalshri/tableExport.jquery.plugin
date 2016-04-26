/*
The MIT License (MIT)

Copyright (c) 2014 https://github.com/kayalshri/

UPDATED BY Dobobaie 26/04/2016 - dobobaie@hotmail.fr

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
            tableExport: function(options, datas) {
                var defaults = {
						tableName: 'yourTableName',
						type: 'csv',
						consoleLog:'false',
						pdfFontSize:14,
						pdfRowPage:26,
						pdfLeftMargin:20
				};
				var options = $.extend(defaults, options);
				var el = this;
				var actions = {
					txt: function(toExport) {
						//
					},
					png: function(toExport) {
						//
					},
					csv: function(toExport) {
						var formatCsvDatas = function(toExport)
						{
							var formatData = '';
							var first = toExport.slice(0).shift();
							for (var index in first) {
								formatData += first[index].name+(first.length == parseInt(index) + 1 ? '' : ';');
							}
							formatData += String.fromCharCode(13)+String.fromCharCode(10);
							for (var index in toExport) {
								for (var key in toExport[index]) {
									formatData += toExport[index][key].value+(toExport[index].length == parseInt(key) + 1 ? '' : ';');
								}
								if (toExport.length != parseInt(index) + 1)
									formatData += String.fromCharCode(13)+String.fromCharCode(10);
							}
							if (options.consoleLog === 'true')
								console.log(formatData);
							return formatData;
						};
						var formatData = formatCsvDatas(toExport);
						var base64data = $.base64.encode(formatData);
						window.open('data:application/'+options.type+';filename='+options.tableName+'.'+options.type+';base64,'+base64data);
					},
					sql: function(toExport) {
						var formatSqlDatas = function(toExport)
						{
							var formatData = 'INSERT INTO `'+options.tableName+'` (';
							var first = toExport.slice(0).shift();
							for (var index in first) {
								formatData += "'"+first[index].id+"'"+(first.length == parseInt(index) + 1 ? '' : ',');
							}
							formatData += ') VALUES ';
							for (var index in toExport) {
								formatData += '(';
									for (var key in toExport[index]) {
										formatData += "'"+toExport[index][key].value+"'"+(toExport[index].length == parseInt(key) + 1 ? '' : ',');
									}
								formatData += ')'+(toExport.length == parseInt(index) + 1 ? '' : ',');
							}
							formatData += ';';
							if (options.consoleLog === 'true')
								console.log(formatData);
							return formatData;
						};
						var formatData = formatSqlDatas(toExport);
						var base64data = $.base64.encode(formatData);
						window.open('data:application/'+options.type+';filename='+options.tableName+'.'+options.type+';base64,'+base64data);
					},
					json: function(toExport) {
						var formatJsonDatas = function(toExport)
						{
							var formatData = '[{"header":[';
							var first = toExport.slice(0).shift();
							for (var index in first) {
								formatData += '{"id": "'+first[index].id+'","value":"'+first[index].name+'"}'+(first.length == parseInt(index) + 1 ? '' : ',');
							}
							formatData += '],"data":[';
							for (var index in toExport) {
								for (var key in toExport[index]) {
									formatData += '{"id":"'+toExport[index][key].id+'","value":"'+toExport[index][key].value+'"}'+(toExport[index].length == parseInt(key) + 1 ? '' : ',');
								}
								if (toExport.length != parseInt(index) + 1)
									formatData += ',';
							}
							formatData += ']}]';
							if (options.consoleLog === 'true')
								console.log(formatData);
							return formatData;
						};
						var formatData = formatJsonDatas(toExport);
						var base64data = $.base64.encode(formatData);
						window.open('data:application/'+options.type+';filename='+options.tableName+'.'+options.type+';base64,'+base64data);
					},
					xml: function(toExport) {
						var formatXmlDatas = function(toExport)
						{
							var formatData = '<?xml version="1.0" encoding="utf-8"?><table><header>';
							var first = toExport.slice(0).shift();
							for (var index in first) {
								formatData += '<data data-id="'+first[index].id+'">'+first[index].name+'</data>';
							}
							formatData += '</header><datas>';
							for (var index in toExport) {
								for (var key in toExport[index]) {
									formatData += '<data data-id="'+toExport[index][key].id+'">'+toExport[index][key].value+'</data>';
								}
							}
							formatData += '</datas></table>';
							if (options.consoleLog === 'true')
								console.log(formatData);
							return formatData;
						};
						var formatData = formatXmlDatas(toExport);
						var base64data = $.base64.encode(formatData);
						window.open('data:application/'+options.type+';filename='+options.tableName+'.'+options.type+';base64,'+base64data);
					},
					html: function(toExport) {
						var formatHtmlDatas = function(toExport)
						{
							var formatData = '<table><tr>';
							var first = toExport.slice(0).shift();
							for (var index in first) {
								formatData += '<td data-id="'+first[index].id+'">'+first[index].name+'</td>';
							}
							formatData += '</tr>';
							for (var index in toExport) {
								formatData += '<tr>';
								for (var key in toExport[index]) {
									formatData += '<td data-id="'+toExport[index][key].id+'">'+toExport[index][key].value+'</td>';
								}
								formatData += '</tr>';
							}
							formatData += '</table>';
							if (options.consoleLog === 'true')
								console.log(formatData);
							return formatData;
						};
						var formatData = formatHtmlDatas(toExport);
						var base64data = $.base64.encode(formatData);
						window.open('data:application/'+options.type+';filename='+options.tableName+'.'+options.type+';base64,'+base64data);
					},
					excel: function(toExport) {
						var formatExcelDatas = function(toExport)
						{
							var formatData = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:"+options.type+"' xmlns='http://www.w3.org/TR/REC-html40'>";
							formatData += "<head>";
							formatData += "<!--[if gte mso 9]>";
							formatData += "<xml>";
							formatData += "<x:ExcelWorkbook>";
							formatData += "<x:ExcelWorksheets>";
							formatData += "<x:ExcelWorksheet>";
							formatData += "<x:Name>";
							formatData += "{worksheet}";
							formatData += "</x:Name>";
							formatData += "<x:WorksheetOptions>";
							formatData += "<x:DisplayGridlines/>";
							formatData += "</x:WorksheetOptions>";
							formatData += "</x:ExcelWorksheet>";
							formatData += "</x:ExcelWorksheets>";
							formatData += "</x:ExcelWorkbook>";
							formatData += "</xml>";
							formatData += "<![endif]-->";
							formatData += "</head>";
							formatData += "<body>";
							formatData += '<table><tr>';
							var first = toExport.slice(0).shift();
							for (var index in first) {
								formatData += '<td data-id="'+first[index].id+'">'+first[index].name+'</td>';
							}
							formatData += '</tr>';
							for (var index in toExport) {
								formatData += '<tr>';
								for (var key in toExport[index]) {
									formatData += '<td data-id="'+toExport[index][key].id+'">'+toExport[index][key].value+'</td>';
								}
								formatData += '</tr>';
							}
							formatData += '</table>';
							formatData += "</body>";
							formatData += "</html>";
							if (options.consoleLog === 'true')
								console.log(formatData);
							return formatData;
						};
						var formatData = formatExcelDatas(toExport);
						var base64data = $.base64.encode(formatData);
						window.open('data:application/vnd.ms-'+options.type+';filename='+options.tableName+'.'+options.type+';base64,'+base64data);
					},
					pdf: function(toExport) {
						var doc = new jsPDF('p','pt', 'a4', true);
						var marge = 0;
						var first = toExport.slice(0).shift();
						doc.setFontSize(options.pdfFontSize);
						for (var index in first) {
							doc.text(options.pdfLeftMargin + (marge * 9), 20, first[index].name);
							marge += first[index].name.length > first[index].value.length ? first[index].name.length : first[index].value.length;
						}
						var page = 1;
						var startRowPosition = 20;
						for (var index in toExport) {
							if (parseInt(index) + 1 % options.pdfRowPage == 0){
								doc.addPage();
								page++;
								startRowPosition = startRowPosition + 10;
							}
							marge = 0;
							var rowPosition = (startRowPosition + ((parseInt(index) + 1) * 30)) - ((page - 1) * 280);
							for (var key in toExport[index]) {
								doc.text(options.pdfLeftMargin + (marge * 9), rowPosition, toExport[index][key].value);
								marge += toExport[index][key].name.length > toExport[index][key].value.length ? toExport[index][key].name.length : toExport[index][key].value.length;
							}
						}
						doc.output('datauri');
					},
				};

				//
				actions.powerpoint = actions.excel;
				actions.doc = actions.excel;

				if (typeof actions[options.type] != 'function')
					return ;

				var toExport = [];

				for (var key in datas) {
					var build = [];
					$('.exportId').each(function(index, value) {
						if ($(this).is(':checked') == true && typeof datas[key][$(this).attr('data-field')] === 'string') {
							build.push({
								name: $(this).attr('data-name'),
								id: $(this).attr('data-field'),
								value: datas[key][$(this).attr('data-field')]
							});
						}
					});
					toExport.push(build);
				}

				if (toExport.length > 0)
					actions[options.type](toExport);
			}
        });
    })(jQuery);
