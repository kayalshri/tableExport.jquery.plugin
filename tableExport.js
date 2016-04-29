/*
 tableExport.jquery.plugin

 Copyright (c) 2015 hhurz, https://github.com/hhurz/tableExport.jquery.plugin
 Updated by dobobaie

 Original work Copyright (c) 2014 Giri Raj, https://github.com/kayalshri/
 Licensed under the MIT License, http://opensource.org/licenses/mit-license
 */

 (function($){
  $.fn.extend({
    tableExport: function(options, datas) {
      var defaults = {
        tableName: 'yourTableName',
        type: 'csv',
        consoleLog:'false',
        csv: {
          separator: ';',
          afterRow: String.fromCharCode(13)+String.fromCharCode(10)
        },
        pdf: {
          orientation: 'p',
          unit: 'pt',
          format: 'a4',
          style: {
            styles: {
              cellPadding: 2,
              rowHeight: 12,
              fontSize: 8,
              fillColor: 255,
              textColor: 50,
              fontStyle: 'normal',
              overflow: 'ellipsize',
              halign: 'left',
              valign: 'middle'
            },
            headerStyles: {
              fillColor: [52, 73, 94],
              textColor: 255,
              fontStyle: 'bold',
              halign: 'center'
            },
            bodyStyles: {
              fillColor: [52, 73, 94],
              textColor: 240
            },
            alternateRowStyles: {
              fillColor: [74, 96, 117]
            }
          }
        }
      };
      var options = $.extend(defaults, options);
      var DownloadEvt = null;
      var tools = {
        downloadFile: function(filename, header, data) {

          var ua = window.navigator.userAgent;
          if (ua.indexOf("MSIE ") > 0 || !!ua.match(/Trident.*rv\:11\./)) {
                      // Internet Explorer (<= 9) workaround by Darryl (https://github.com/dawiong/tableExport.jquery.plugin)
                      // based on sampopes answer on http://stackoverflow.com/questions/22317951
                      // ! Not working for json and pdf format !
                      var frame = document.createElement("iframe");

                      if (frame) {
                        document.body.appendChild(frame);
                        frame.setAttribute("style", "display:none");
                        frame.contentDocument.open("txt/html", "replace");
                        frame.contentDocument.write(data);
                        frame.contentDocument.close();
                        frame.focus();

                        frame.contentDocument.execCommand("SaveAs", true, filename);
                        document.body.removeChild(frame);
                      }
                    }
                    else {
                      var DownloadLink = document.createElement('a');

                      if (DownloadLink) {
                        DownloadLink.style.display = 'none';
                        DownloadLink.download = filename;

                        if (header.toLowerCase().indexOf("base64,") >= 0)
                          DownloadLink.href = header + tools.base64encode(data);
                        else
                          DownloadLink.href = header + encodeURIComponent(data);

                        document.body.appendChild(DownloadLink);

                        if (document.createEvent) {
                          if (DownloadEvt == null)
                            DownloadEvt = document.createEvent('MouseEvents');

                          DownloadEvt.initEvent('click', true, false);
                          DownloadLink.dispatchEvent(DownloadEvt);
                        }
                        else if (document.createEventObject)
                          DownloadLink.fireEvent('onclick');
                        else if (typeof DownloadLink.onclick == 'function')
                          DownloadLink.onclick();

                        document.body.removeChild(DownloadLink);
                      }
                    }
                  },
                  utf8Encode: function(string) {
                    string = string.replace(/\x0d\x0a/g, "\x0a");
                    var utftext = "";
                    for (var n = 0; n < string.length; n++) {
                      var c = string.charCodeAt(n);
                      if (c < 128) {
                        utftext += String.fromCharCode(c);
                      }
                      else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                      }
                      else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                      }
                    }
                    return utftext;
                  },
                  base64encode: function(input) {
                    var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
                    var output = "";
                    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                    var i = 0;
                    input = tools.utf8Encode(input);
                    while (i < input.length) {
                      chr1 = input.charCodeAt(i++);
                      chr2 = input.charCodeAt(i++);
                      chr3 = input.charCodeAt(i++);
                      enc1 = chr1 >> 2;
                      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                      enc4 = chr3 & 63;
                      if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                      } else if (isNaN(chr3)) {
                        enc4 = 64;
                      }
                      output = output +
                      keyStr.charAt(enc1) + keyStr.charAt(enc2) +
                      keyStr.charAt(enc3) + keyStr.charAt(enc4);
                    }
                    return output;
                  }
                };
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
                        formatData += '"'+first[index].name+'"'+(first.length == parseInt(index) + 1 ? '' : options.csv.separator);
                      }
                      formatData += options.csv.afterRow;
                      for (var index in toExport) {
                        for (var key in toExport[index]) {
                          formatData += '"'+toExport[index][key].value+'"'+(toExport[index].length == parseInt(key) + 1 ? '' : options.csv.separator);
                        }
                        if (toExport.length != parseInt(index) + 1)
                          formatData += options.csv.afterRow;
                      }
                      if (options.consoleLog === 'true')
                        console.log(formatData);
                      return formatData;
                    };
                    var formatData = formatCsvDatas(toExport);
                    tools.downloadFile(options.tableName+'.'+options.type, 'data:text/'+options.type+';base64,', formatData);
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
                    tools.downloadFile(options.tableName+'.'+options.type, 'data:application/'+options.type+';base64,', formatData);
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
                    tools.downloadFile(options.tableName+'.'+options.type, 'data:application/'+options.type+';base64,', formatData);
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
                    tools.downloadFile(options.tableName+'.'+options.type, 'data:application/'+options.type+';base64,', formatData);
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
                    tools.downloadFile(options.tableName+'.'+options.type, 'data:application/'+options.type+';base64,', formatData);
                  },
                  excel: function(toExport) {
                    var formatExcelDatas = function(toExport)
                    {
                      var MSDocType = (options.type == 'excel' || options.type == 'xls') ? 'excel' : 'word';
                      var MSDocExt = (MSDocType == 'excel') ? 'xls' : 'doc';
                      var MSDocSchema = (MSDocExt == 'xls') ? 'xmlns:x="urn:schemas-microsoft-com:office:excel"' : 'xmlns:w="urn:schemas-microsoft-com:office:word"';
                      var formatData = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' + MSDocSchema + ' xmlns="http://www.w3.org/TR/REC-html40">';
                      formatData += "<head>";
                      formatData += '<meta http-equiv="content-type" content="application/vnd.ms-' + MSDocType + '; charset=UTF-8">';
                      formatData += "<!--[if gte mso 9]>";
                      formatData += "<xml>";
                      formatData += "<x:ExcelWorkbook>";
                      formatData += "<x:ExcelWorksheets>";
                      formatData += "<x:ExcelWorksheet>";
                      formatData += "<x:Name>";
                      formatData += options.tableName;
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
                    var f
                    ormatData = formatExcelDatas(toExport);
                    tools.downloadFile(options.tableName+'.'+options.type, 'data:application/vnd.ms-'+options.type+';base64,', formatData);
                  },
                  pdf: function(toExport) {
                    var doc = new jsPDF(defaults.pdf.orientation, defaults.pdf.unit, defaults.pdf.format);
                    var header = [];
                    var body = [];
                    var first = toExport.slice(0).shift();
                    for (var index in first) {
                      header.push({
                        title: first[index].name,
                        dataKey: first[index].id
                      });
                    }
                    for (var index in toExport) {
                      var toSend = {};
                      for (var key in toExport[index]) {
                        toSend[toExport[index][key].id] = toExport[index][key].value;
                      }
                      body.push(toSend);
                    }
                    doc.autoTable(header, body, options.style);
                    doc.save(options.tableName+'.'+options.type);
                  },
                };

            //
            actions.xls = actions.excel;
            actions.doc = actions.excel;
            actions.word = actions.excel;

            if (typeof actions[options.type] != 'function')
              return ;

            if (datas.length > 0)
              actions[options.type](datas);
          }
        });
})(jQuery);
