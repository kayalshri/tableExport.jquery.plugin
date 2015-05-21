/*The MIT License (MIT)

Original work Copyright (c) 2014 https://github.com/kayalshri/
Modified work Copyright (c) 2015 https://github.com/hhurz/

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
        displayTableName: false,
        theadSelector: 'tr',
        tbodySelector: 'tr',
        tableName: 'myTableName',
        worksheetName: 'xlsWorksheetName',
        type: 'csv',
        jspdf: { orientation: 'p', unit:'pt', format:'a4',
                 margins: {left: 20, right: 10, top: 10, bottom: 10},
                 autotable: {padding: 2, lineHeight: 12, fontSize: 8} },
        escape: false,
        htmlContent: false,
        consoleLog: false,
        outputMode: 'file',  // file|string|base64
        fileName: 'tableExport',
        excelstyles: [ 'border-bottom', 'border-top', 'border-left', 'border-right' ]
      };

      var options = $.extend(true, defaults, options);
      var el = this;
      var DownloadEvt = null;

      if(defaults.type == 'csv' || defaults.type == 'txt'){

        // Header
        var tdData ="";
        var rowIndex = 0;
        $(el).find('thead').find(defaults.theadSelector).each(function() {
        tdData += "\n";
          $(this).filter(':visible').find('th').each(function(index,data) {
            if ($(this).css('display') != 'none' &&
                $(this).data("tableexport-display") != 'none'){
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
        $(el).find('tbody').find(defaults.tbodySelector).each(function() {
        tdData += "\n";
          $(this).filter(':visible').find('td').each(function(index,data) {
            if ($(this).css('display') != 'none' &&
                $(this).data("tableexport-display") != 'none'){
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
        if(defaults.consoleLog === true)
          console.log(tdData);

        if(defaults.outputMode == 'string')
          return tdData;

        if(defaults.outputMode == 'base64')
          return base64encode(tdData);

        try {
          var blob = new Blob([(defaults.type == 'csv' ? '\ufeff' : '') + tdData], {type: "text/"+(defaults.type == 'csv' ? 'csv' : 'plain')+";charset=utf-8"});
          saveAs (blob, defaults.fileName + '.' + defaults.type);
        }
        catch (e) {
          downloadFile(defaults.fileName + '.' + defaults.type,
                       'data:text/'+(defaults.type == 'csv' ? 'csv' : 'plain')+';charset=utf-8,' + (defaults.type == 'csv' ? '\ufeff' : '') +
                       encodeURIComponent(tdData));
        }

      }else if(defaults.type == 'sql'){

        // Header
        var rowIndex = 0;
        var tdData ="INSERT INTO `"+defaults.tableName+"` (";
        $(el).find('thead').find(defaults.theadSelector).each(function() {

          $(this).filter(':visible').find('th').each(function(index,data) {
            if ($(this).css('display') != 'none' &&
                $(this).data("tableexport-display") != 'none'){
              if(defaults.ignoreColumn.indexOf(index) == -1){
                tdData += "'" + parseString(this, rowIndex, index) + "'," ;
              }
            }

          });
          rowIndex++;
          tdData = $.trim(tdData);
          tdData = $.trim(tdData).substring(0, tdData.length -1);
        });
        tdData += ") VALUES ";
        // Row vs Column
        $(el).find('tbody').find(defaults.tbodySelector).each(function() {
        tdData += "(";
          $(this).filter(':visible').find('td').each(function(index,data) {
            if ($(this).css('display') != 'none' &&
                $(this).data("tableexport-display") != 'none'){
              if(defaults.ignoreColumn.indexOf(index) == -1){
                tdData += "'" + parseString(this, rowIndex, index) + "',";
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
        if(defaults.consoleLog === true)
          console.log(tdData);

        if(defaults.outputMode == 'string')
          return tdData;

        if(defaults.outputMode == 'base64')
          return base64encode(tdData);

        try {
          var blob = new Blob([tdData], {type: "text/plain;charset=utf-8"});
          saveAs (blob, defaults.fileName + '.sql');
        }
        catch (e) {
          downloadFile(defaults.fileName+'.sql', 'data:application/sql;charset=utf-8,' + encodeURIComponent(tdData));
        }

      }else if(defaults.type == 'json'){

        var jsonHeaderArray = [];
        $(el).find('thead').find(defaults.theadSelector).each(function() {
          var tdData ="";
          var jsonArrayTd = [];
          var rowIndex = 0;

          $(this).filter(':visible').find('th').each(function(index,data) {
            if ($(this).css('display') != 'none' &&
                $(this).data("tableexport-display") != 'none'){
              if(defaults.ignoreColumn.indexOf(index) == -1){
                jsonArrayTd.push(parseString(this, rowIndex, index));
              }
            }
          });
          rowIndex++;
          jsonHeaderArray.push(jsonArrayTd);

        });

        var jsonArray = [];
        $(el).find('tbody').find(defaults.tbodySelector).each(function() {
          var tdData ="";
          var jsonArrayTd = [];

          $(this).filter(':visible').find('td').each(function(index,data) {
            if ($(this).css('display') != 'none' &&
                $(this).data("tableexport-display") != 'none'){
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

        var sdata = JSON.stringify(jsonExportArray);

        if(defaults.consoleLog === true)
          console.log(sdata);

        if(defaults.outputMode == 'string')
          return sdata;

        var base64data = base64encode(sdata);

        if(defaults.outputMode == 'base64')
          return base64data;

        try {
          var blob = new Blob([sdata], {type: "application/json;charset=utf-8"});
          saveAs (blob, defaults.fileName + '.json');
        }
        catch (e) {
          downloadFile(defaults.fileName+'.json', 'data:application/json;charset=utf-8;base64,' + base64data);
        }

      }else if(defaults.type == 'xml'){

        var rowIndex = 0;
        var xml = '<?xml version="1.0" encoding="utf-8"?>';
        xml += '<tabledata><fields>';

        // Header
        $(el).find('thead').find(defaults.theadSelector).each(function() {
          $(this).filter(':visible').find('th').each(function(index,data) {
            if ($(this).css('display') != 'none' &&
                $(this).data("tableexport-display") != 'none'){
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
        $(el).find('tbody').find(defaults.tbodySelector).each(function() {
          xml += '<row id="'+rowCount+'">';
          var colCount=0;
          $(this).filter(':visible').find('td').each(function(index,data) {
            if ($(this).css('display') != 'none' &&
                $(this).data("tableexport-display") != 'none'){
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
        if(defaults.consoleLog === true)
          console.log(xml);

        if(defaults.outputMode == 'string')
          return xml;

        var base64data = base64encode(xml);

        if(defaults.outputMode == 'base64')
          return base64data;

        try {
          var blob = new Blob([xml], {type: "application/xml;charset=utf-8"});
          saveAs (blob, defaults.fileName + '.xml');
        }
        catch (e) {
          downloadFile(defaults.fileName+'.xml', 'data:application/xml;charset=utf-8;base64,' + base64data);
        }

      }else if(defaults.type == 'excel' || defaults.type == 'doc'){
        //console.log($(this).html());

        var rowIndex = 0;
        var excel="<table>";
        // Header
        $(el).find('thead').find(defaults.theadSelector).each(function() {
          excel += "<tr>";
          $(this).filter(':visible').find('th,td').each(function(index,data) {
            if ($(this).css('display') != 'none' &&
                $(this).data("tableexport-display") != 'none'){
              if(defaults.ignoreColumn.indexOf(index) == -1){
                excel += "<td style='";
                for( var styles in defaults.excelstyles ) {
                  if( defaults.excelstyles.hasOwnProperty(styles) ) {
                    excel += defaults.excelstyles[styles] + ": " + $(this).css(defaults.excelstyles[styles]) + ";";
                  }
                }
                excel += "'>" + parseString(this, rowIndex, index)+ "</td>";
              }
            }
          });
          rowIndex++;
          excel += '</tr>';
        });

        // Row Vs Column
        var rowCount=1;
        $(el).find('tbody').find(defaults.tbodySelector).each(function() {
          excel += "<tr>";
          var colCount=0;
          $(this).filter(':visible').find('td').each(function(index,data) {
            if ($(this).css('display') != 'none' &&
                $(this).data("tableexport-display") != 'none'){
              if(defaults.ignoreColumn.indexOf(index) == -1){
                excel += "<td style='";
                for( var styles in defaults.excelstyles ) {
                  if( defaults.excelstyles.hasOwnProperty(styles) ) {
                    excel += defaults.excelstyles[styles] + ": " + $(this).css(defaults.excelstyles[styles]) + ";";
                  }
                }
                if ($(this).is("[colspan]"))
                  excel += "' colspan='" + $(this).attr('colspan');
                excel += "'>" + parseString(this, rowIndex, index) + "</td>";
              }
            }
            colCount++;
          });
          rowCount++;
          rowIndex++;
          excel += '</tr>';
        });

        if(defaults.displayTableName)
          excel +="<tr><td></td></tr><tr><td></td></tr><tr><td>" + parseString($('<p>' + defaults.tableName + '</p>')) + "</td></tr>";

        excel += '</table>'

        if(defaults.consoleLog === true)
          console.log(excel);

        var excelFile = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:x='urn:schemas-microsoft-com:office:"+defaults.type+"' xmlns='http://www.w3.org/TR/REC-html40'>";
        excelFile += '<meta http-equiv="content-type" content="application/vnd.ms-'+defaults.type+'; charset=UTF-8">';
        excelFile += '<meta http-equiv="content-type" content="application/';
        excelFile += (defaults.type == 'excel')? 'vnd.ms-excel' : 'msword';
        excelFile += '; charset=UTF-8">';
        excelFile += "<head>";
        if (defaults.type == 'excel') {
          excelFile += "<!--[if gte mso 9]>";
          excelFile += "<xml>";
          excelFile += "<x:ExcelWorkbook>";
          excelFile += "<x:ExcelWorksheets>";
          excelFile += "<x:ExcelWorksheet>";
          excelFile += "<x:Name>";
          excelFile += defaults.worksheetName;
          excelFile += "</x:Name>";
          excelFile += "<x:WorksheetOptions>";
          excelFile += "<x:DisplayGridlines/>";
          excelFile += "</x:WorksheetOptions>";
          excelFile += "</x:ExcelWorksheet>";
          excelFile += "</x:ExcelWorksheets>";
          excelFile += "</x:ExcelWorkbook>";
          excelFile += "</xml>";
          excelFile += "<![endif]-->";
        }
        excelFile += "</head>";
        excelFile += "<body>";
        excelFile += excel;
        excelFile += "</body>";
        excelFile += "</html>";

        if(defaults.outputMode == 'string')
          return excelFile;

        var base64data = base64encode(excelFile);

        if(defaults.outputMode == 'base64')
          return base64data;

        var extension = (defaults.type == 'excel')? 'xls' : 'doc';
        try {
          var blob = new Blob([excelFile], {type: 'application/vnd.ms-'+defaults.type});
          saveAs (blob, defaults.fileName+'.'+extension);
        }
        catch (e) {
          downloadFile(defaults.fileName+'.'+extension, 'data:application/vnd.ms-'+defaults.type+';base64,' + base64data);
        }

      }else if(defaults.type == 'png'){
        html2canvas($(el), {
          onrendered: function(canvas) {

            var image = canvas.toDataURL();
            image = image.substring(22); // remove data stuff

            var byteString = atob(image);
            var buffer = new ArrayBuffer(byteString.length);
            var intArray = new Uint8Array(buffer);

            for (var i = 0; i < byteString.length; i++)
              intArray[i] = byteString.charCodeAt(i);

            try {
              var blob = new Blob([buffer], { type: "image/png" });
              saveAs (blob, defaults.fileName + '.png');
            }
            catch (e) {
              downloadFile(defaults.fileName+'.png', 'data:image/png;base64,' + image);
            }
          }
        });

      }else if(defaults.type == 'pdf'){
        var doc = new jsPDF(defaults.jspdf.orientation, defaults.jspdf.unit, defaults.jspdf.format);

        if ( defaults.jspdf.autotable === false ) {
          var options = {
            dim:{
              w: getPropertyUnitValue ($(el).get(0), 'width', 'mm'),
              h: getPropertyUnitValue ($(el).get(0), 'height', 'mm')
            }
          }
          doc.addHTML($(el),defaults.jspdf.margins.left,defaults.jspdf.margins.top,options,function() {
            jsPdfOutput (doc);
          });
        }
        else {
          var headers = [];
          $(el).find('thead').find(defaults.theadSelector).each(function() {
            var rowIndex = 0;

            $(this).filter(':visible').find('th').each(function(index,data) {
              if ($(this).css('display') != 'none' &&
                  $(this).data("tableexport-display") != 'none'){
                if(defaults.ignoreColumn.indexOf(index) == -1){
                  headers.push(parseString(this, rowIndex, index));
                }
              }
            });
            rowIndex++;
          });

          var rows = [];
          $(el).find('tbody').find(defaults.tbodySelector).each(function() {
            var rowData = [];

            $(this).filter(':visible').find('td').each(function(index,data) {
              if ($(this).css('display') != 'none' &&
                  $(this).data("tableexport-display") != 'none'){
                if(defaults.ignoreColumn.indexOf(index) == -1){
                  rowData.push(parseString(this, rowIndex, index));
                }
              }
            });
            rowIndex++;
            rows.push(rowData);
          });
          
          defaults.jspdf.autotable.margins = {};
          $.extend(true, defaults.jspdf.autotable.margins, defaults.jspdf.margins);

          doc.autoTable(headers, rows, defaults.jspdf.autotable);
          
          jsPdfOutput (doc);
        }
      }

      function jsPdfOutput (doc){
        if(defaults.consoleLog === true)
          console.log(doc.output());

        if(defaults.outputMode == 'string')
          return doc.output();

        if(defaults.outputMode == 'base64')
          return base64encode(doc.output());

        try {
          var blob = doc.output('blob');
          saveAs (blob, defaults.fileName + '.pdf');
        }
        catch (e) {
          downloadFile(defaults.fileName+'.pdf', 'data:application/pdf;base64,' + base64encode(doc.output()));
        }
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
          result = defaults.csvEnclosure + dataString.toLocaleString() + defaults.csvEnclosure;
        else{
          result = replaceAll (csvValue, defaults.csvEnclosure, defaults.csvEnclosure + defaults.csvEnclosure);

          if ( result.indexOf (defaults.csvSeparator) >= 0 || /[\r\n ]/g.test(result) )
            result = defaults.csvEnclosure + result + defaults.csvEnclosure;
        }

        return result;
      }

      function parseString(cell, rowIndex, colIndex){
        var $cell = $(cell);

        if(defaults.htmlContent === true){
          content_data = $cell.html().trim();
        }else{
          content_data = $cell.text().trim().replace(/\u00AD/g, ""); // remove soft hyphens
        }

        if(defaults.escape === true){
          content_data = escape(content_data);
        }

        if (typeof defaults.onCellData === 'function'){
          content_data = defaults.onCellData($cell, rowIndex, colIndex, content_data);
        }

        return content_data;
      }

      function hyphenate (a, b, c){
        return b + "-" + c.toLowerCase();
      }

      // get computed style property
      function getStyle (target, prop){
        if(window.getComputedStyle){ // gecko and webkit
          prop = prop.replace(/([a-z])([A-Z])/, hyphenate);  // requires hyphenated, not camel
          return window.getComputedStyle(target, null).getPropertyValue(prop);
        }
        if(target.currentStyle){ // ie
          return target.currentStyle[prop];
        }
        return target.style[prop];
      }

      function getPropertyUnitValue (target, prop, unit){
        var baseline = 100;  // any number serves

        var value = getStyle(target, prop);  // get the computed style value

        var numeric = value.match(/\d+/);  // get the numeric component
        if(numeric !== null) {
          numeric = numeric[0];  // get the string

          var temp = document.createElement("div");  // create temporary element
          temp.style.overflow = "hidden";  // in case baseline is set too low
          temp.style.visibility = "hidden";  // no need to show it

          target.parentElement.appendChild(temp); // insert it into the parent for em, ex and %

          temp.style.width = baseline + unit;
          var factor = baseline / temp.offsetWidth;

          target.parentElement.removeChild(temp);  // clean up

          return (numeric * factor);
        }
        return 0;
      }

      function downloadFile(filename, data){
        var DownloadLink = document.createElement('a');

        if ( DownloadLink ){
          document.body.appendChild(DownloadLink);
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

      function utf8Encode(string) {
        string = string.replace(/\x0d\x0a/g, "\x0a");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
          var c = string.charCodeAt(n);
          if (c < 128) {
            utftext += String.fromCharCode(c);
          }
          else if((c > 127) && (c < 2048)) {
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
      }

      function base64encode(input) {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = utf8Encode(input);
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
    }
  });
})(jQuery);
