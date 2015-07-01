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
        consoleLog: false,
        displayTableName: false,
        escape: false,
        excelstyles: [ 'border-bottom', 'border-top', 'border-left', 'border-right' ],
        fileName: 'tableExport',
        htmlContent: false,
        ignoreColumn: [],
        jspdf: { orientation: 'p', 
                 unit:'pt', 
                 format:'a4',
                 margins: { left: 20, right: 10, top: 10, bottom: 10 },
                 autotable: { padding: 2,
                              lineHeight: 12,
                              fontSize: 8,
                              tableExport: { onAfterAutotable: null,
                                             onBeforeAutotable: null,
                                             onTable: null
                                           }
                            }
               },
        onCellData: null,
        outputMode: 'file',  // file|string|base64
        tbodySelector: 'tr',
        theadSelector: 'tr',
        tableName: 'myTableName',
        type: 'csv',
        worksheetName: 'xlsWorksheetName'
      };

      var options = $.extend(true, defaults, options);
      var el = this;
      var DownloadEvt = null;
      var rowspans = [];

      if(defaults.type == 'csv' || defaults.type == 'txt'){

        // Header
        var tdData ="";
        var rowIndex = 0;
        $(el).find('thead').first().find(defaults.theadSelector).each(function() {
          tdData += "\n";
          ForEachVisibleCell(this, 'th,td', rowIndex,
                             function(cell, row, col) {
                               tdData += csvString(cell, row, col) + defaults.csvSeparator;
                             });
          rowIndex++;
          tdData = $.trim(tdData);
          tdData = $.trim(tdData).substring(0, tdData.length -1);
        });

        // Row vs Column
        $(el).find('tbody').first().find(defaults.tbodySelector).each(function() {
          trData = "";
          ForEachVisibleCell(this, 'td', rowIndex,
                             function(cell, row, col) {
                               trData += csvString(cell, row, col) + defaults.csvSeparator;
                             });
          if (trData.length > defaults.csvSeparator.length)
            tdData += "\n" + trData;
          rowIndex++;
          //tdData = $.trim(tdData);
          tdData = $.trim(tdData).substring(0, tdData.length -1);
        });

        tdData += "\n";

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
        $(el).find('thead').first().find(defaults.theadSelector).each(function() {

          ForEachVisibleCell(this, 'th,td', rowIndex,
                             function(cell, row, col) {
                               tdData += "'" + parseString(cell, row, col) + "'," ;
                             });
          rowIndex++;
          tdData = $.trim(tdData);
          tdData = $.trim(tdData).substring(0, tdData.length -1);
        });
        tdData += ") VALUES ";
        // Row vs Column
        $(el).find('tbody').first().find(defaults.tbodySelector).each(function() {
          trData = "";
          ForEachVisibleCell(this, 'td', rowIndex,
                             function(cell, row, col) {
                               trData += "'" + parseString(cell, row, col) + "'," ;
                             });
          if (trData.length > 3){
            tdData += "(" + trData;
            tdData = $.trim(tdData).substring(0, tdData.length -1);
            tdData += "),";
          }
          rowIndex++;
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
        $(el).find('thead').first().find(defaults.theadSelector).each(function() {
          var tdData ="";
          var jsonArrayTd = [];
          var rowIndex = 0;

          ForEachVisibleCell(this, 'th,td', rowIndex,
                             function(cell, row, col) {
                               jsonArrayTd.push(parseString(cell, row, col));
                             });
          jsonHeaderArray.push(jsonArrayTd);

          rowIndex++;
        });

        var jsonArray = [];
        $(el).find('tbody').first().find(defaults.tbodySelector).each(function() {
          var tdData ="";
          var jsonArrayTd = [];

          ForEachVisibleCell(this, 'td', rowIndex,
                             function(cell, row, col) {
                               jsonArrayTd.push(parseString(cell, row, col));
                             });

          if (jsonArrayTd.length > 0 && (jsonArrayTd.length != 1 || jsonArrayTd[0] != "") )
            jsonArray.push(jsonArrayTd);

          rowIndex++;
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
        $(el).find('thead').first().find(defaults.theadSelector).each(function() {

          ForEachVisibleCell(this, 'th,td', rowIndex,
                             function(cell, row, col) {
                               xml += "<field>" + parseString(cell, row, col) + "</field>";
                             });
          rowIndex++;
        });
        xml += '</fields><data>';

        // Row Vs Column
        var rowCount=1;
        $(el).find('tbody').first().find(defaults.tbodySelector).each(function() {
          var colCount=1;
          var rxml="";
          ForEachVisibleCell(this, 'td', rowIndex,
                             function(cell, row, col) {
                               rxml += "<column-"+colCount+">"+parseString(cell, row, col)+"</column-"+colCount+">";
                               colCount++;
                             });
          if (rxml != "<column-1></column-1>"){
            xml += '<row id="'+rowCount+'">' + rxml + '</row>';
            rowCount++;
          }

          rowIndex++;
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
        $(el).find('thead').first().find(defaults.theadSelector).each(function() {
          excel += "<tr>";
          ForEachVisibleCell(this, 'th,td', rowIndex,
                             function(cell, row, col) {
                               if (cell != null) {
                                 excel += "<td style='";
                                 for( var styles in defaults.excelstyles ) {
                                   if( defaults.excelstyles.hasOwnProperty(styles) ) {
                                     excel += defaults.excelstyles[styles] + ": " + $(cell).css(defaults.excelstyles[styles]) + ";";
                                   }
                                 }
                                 excel += "'>" + parseString(cell, row, col)+ "</td>";
                               }
                             });
          rowIndex++;
          excel += '</tr>';
        });

        // Row Vs Column
        var rowCount=1;
        $(el).find('tbody').first().find(defaults.tbodySelector).each(function() {
          excel += "<tr>";
          ForEachVisibleCell(this, 'td', rowIndex,
                             function(cell, row, col) {
                               if (cell != null) {
                                 excel += "<td style='";
                                 for( var styles in defaults.excelstyles ) {
                                   if( defaults.excelstyles.hasOwnProperty(styles) ) {
                                     excel += defaults.excelstyles[styles] + ": " + $(cell).css(defaults.excelstyles[styles]) + ";";
                                   }
                                 }
                                 if ($(cell).is("[colspan]"))
                                   excel += "' colspan='" + $(cell).attr('colspan');
                                 if ($(cell).is("[rowspan]"))
                                   excel += "' rowspan='" + $(cell).attr('rowspan');
                                 excel += "'>" + parseString(cell, row, col) + "</td>";
                               }
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
        if ( defaults.jspdf.autotable === false ) {
          var options = {
            dim:{
              w: getPropertyUnitValue ($(el).first().get(0), 'width', 'mm'),
              h: getPropertyUnitValue ($(el).first().get(0), 'height', 'mm')
            },
            pagesplit: false
          }
          
          var doc = new jsPDF(defaults.jspdf.orientation, defaults.jspdf.unit, defaults.jspdf.format);
          doc.addHTML( $(el).first(),
                       defaults.jspdf.margins.left,
                       defaults.jspdf.margins.top,
                       options,
                       function() {
                         jsPdfOutput (doc); 
                       });
          delete doc;
        }
        else {
          // pdf output using jsPDF AutoTable plugin
          // https://github.com/someatoms/jsPDF-AutoTable
          
          var teOptions = defaults.jspdf.autotable.tableExport;
          
          // When setting jspdf.format to 'bestfit' tableExport tries to choose
          // the minimum required paper format and orientation in which the table
          // (or tables in multitable mode) completely fit without column adjustment
          if (typeof defaults.jspdf.format === 'string' && defaults.jspdf.format.toLowerCase() == 'bestfit') {
            var pageFormats = { 'a0': [2383.94, 3370.39], 'a1': [1683.78, 2383.94], 
                                'a2': [1190.55, 1683.78], 'a3': [ 841.89, 1190.55], 
                                'a4': [ 595.28,  841.89] };
            var rk = '', ro = '';
            var mw = 0;

            $(el).filter(':visible').each(function() {
              if ($(this).css('display') != 'none') {
                var w = getPropertyUnitValue ($(this).get(0), 'width', 'pt');

                if ( w > mw ) {
                  if ( w > pageFormats['a0'][0] ) {
                    rk = 'a0';
                    ro = 'l';
                  }
                  for (var key in pageFormats) {
                    if (pageFormats[key][1] > w) {
                      rk = key;
                      ro = 'l';
                      if (pageFormats[key][0] > w)
                        ro = 'p';
                    }
                  }
                  mw = w;
                }
              }
            });
            defaults.jspdf.format = (rk == '' ? 'a4' : rk);
            defaults.jspdf.orientation = (ro == '' ? 'w' : ro);
          }
          
          // The jsPDF doc object is stored in defaults.jspdf.autotable.tableExport, 
          // thus it can be accessed from any callback function from below
          teOptions.doc = new jsPDF(defaults.jspdf.orientation, 
                                    defaults.jspdf.unit, 
                                    defaults.jspdf.format);

          $(el).filter(':visible').each(function() {
            if ($(this).css('display') != 'none') {
              var rowIndex = 0;
              var atOptions = {};
              
              teOptions.columns = [];
              teOptions.rows = [];

              // onTable: optional callback function for every matching table that can be used 
              // to modify the tableExport options or to skip the output of a particular table 
              // when the  table selector targets multiple tables
              if (typeof teOptions.onTable === 'function')
                if (teOptions.onTable($(this), defaults) === false)
                  return true; // continue to next iteration step (table)

              // each table works with an own copy of AutoTable options
              Object.keys(defaults.jspdf.autotable).forEach(function (key) {
                  atOptions[key] = defaults.jspdf.autotable[key];
              });
              atOptions.margins = {};
              $.extend(true, atOptions.margins, defaults.jspdf.margins);

              if (typeof atOptions.renderCell !== 'function') {
  
                // draw cell text with original <td> alignment
                atOptions.renderCell = function (x, y, width, height, key, value, row, settings)
                {
                  var doc = settings.tableExport.doc;
                  var xoffset = 0;

                  doc.setFillColor(row % 2 === 0 ? 245 : 255);
                  doc.setTextColor(50);
                  doc.rect(x, y, width, height, 'F');
                  y += settings.lineHeight / 2 + doc.autoTableTextHeight() / 2 - 2.5;

                  if (typeof settings.tableExport.columns [key] != 'undefined') {
                    var col = settings.tableExport.columns [key];

                    if (col.style.align == 'right')
                      xoffset = width - doc.getStringUnitWidth((''+value)) * doc.internal.getFontSize() - settings.padding;
                    else if (col.style.align == 'center')
                      xoffset = (width - doc.getStringUnitWidth((''+value)) * doc.internal.getFontSize()) / 2;
                  }
                  
                  if (xoffset < settings.padding)
                    xoffset = settings.padding;

                  doc.text(value, x + xoffset, y);
                }
              }

              // collect header and data rows
              $(this).find('thead').find(defaults.theadSelector).each(function() {
                var colKey=0;
              
                ForEachVisibleCell(this, 'th,td', rowIndex,
                                   function(cell, row, col) {
                                     var obj = {title: parseString(cell, row, col), 
                                                key: colKey++,
                                                style: {align: getStyle(cell, 'text-align'),
                                                        bcolor: getStyle(cell, 'background-color')
                                                       }
                                               };
                                     teOptions.columns.push (obj);
                                   });
                rowIndex++;
                colKey=0;
              });

              $(this).find('tbody').find(defaults.tbodySelector).each(function() {
                var rowData = [];

                ForEachVisibleCell(this, 'td', rowIndex,
                                   function(cell, row, col) {
                                     rowData.push(parseString(cell, row, col));
                                   });
                rowIndex++;
                teOptions.rows.push(rowData);
              });

              // onBeforeAutotable: optional callback function before calling 
              // jsPDF AutoTable that can be used to modify the AutoTable options
              if (typeof teOptions.onBeforeAutotable === 'function')
                teOptions.onBeforeAutotable($(this), teOptions.columns, teOptions.rows, atOptions);

              teOptions.doc.autoTable(teOptions.columns, teOptions.rows, atOptions);

              // onAfterAutotable: optional callback function after returning 
              // from jsPDF AutoTable that can be used to modify the AutoTable options
              if (typeof teOptions.onAfterAutotable === 'function')
                teOptions.onAfterAutotable($(this), atOptions);

              // set the start position for the next table (in case there is one)
              defaults.jspdf.autotable.startY = teOptions.doc.autoTableEndPosY() + atOptions.margins.top;
            }
          });
          
          jsPdfOutput(teOptions.doc);

          teOptions.columns.length = 0;
          teOptions.rows.length = 0;
          delete teOptions.doc;
          teOptions.doc = null;
        }
      }

      function ForEachVisibleCell(tableRow, selector, rowIndex, cellcallback) {

        $(tableRow).filter(':visible').find(selector).each(function(colIndex) {
          if ($(this).css('display') != 'none' &&
              $(this).data("tableexport-display") != 'none') {
            if(defaults.ignoreColumn.indexOf(colIndex) == -1) {
              if (typeof(cellcallback) === "function") {
                var cs = 0; // colspan value

                // handle previously detected rowspans
                if (typeof rowspans[rowIndex] != 'undefined' && rowspans[rowIndex].length > 0) {
                  for (c = 0; c <= colIndex; c++) {
                    if (typeof rowspans[rowIndex][c] != 'undefined') {
                      cellcallback(null, rowIndex, c);
                      delete rowspans[rowIndex][c];
                      colIndex++;
                    }
                  }
                }

                // output content of current cell
                cellcallback(this, rowIndex, colIndex);

                // handle colspan of current cell
                if ($(this).is("[colspan]")) {
                  cs = $(this).attr('colspan');
                  for (c = 0; c < cs - 1; c++)
                    cellcallback(null, rowIndex, colIndex + c);
                }

                // store rowspan for following rows
                if ($(this).is("[rowspan]")) {
                  var rs = parseInt($(this).attr('rowspan'));

                  for (r = 1; r < rs; r++) {
                    if (typeof rowspans[rowIndex + r] == 'undefined')
                      rowspans[rowIndex + r] = [];
                    rowspans[rowIndex + r][colIndex] = "";

                    for (c = 1; c < cs; c++)
                      rowspans[rowIndex + r][colIndex + c] = "";
                  }
                }

              }
            }
          }
        });
      }

      function jsPdfOutput(doc){
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
          downloadFile(defaults.fileName + '.pdf', 'data:application/pdf;base64,' + base64encode(doc.output()));
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

        if (cell != null){
          var dataString = parseString(cell, rowIndex, colIndex);

          var csvValue = (dataString === null || dataString == '')? '' : dataString.toString();

          if ( dataString instanceof Date )
            result = defaults.csvEnclosure + dataString.toLocaleString() + defaults.csvEnclosure;
          else{
            result = replaceAll (csvValue, defaults.csvEnclosure, defaults.csvEnclosure + defaults.csvEnclosure);

            if ( result.indexOf (defaults.csvSeparator) >= 0 || /[\r\n ]/g.test(result) )
              result = defaults.csvEnclosure + result + defaults.csvEnclosure;
          }
        }

        return result;
      }

      function parseString(cell, rowIndex, colIndex){
        var result = '';

        if (cell != null){
          var $cell = $(cell);

          if(defaults.htmlContent === true){
            result = $cell.html().trim();
          }else{
            result = $cell.text().trim().replace(/\u00AD/g, ""); // remove soft hyphens
          }

          if(defaults.escape === true){
            result = escape(result);
          }

          if (typeof defaults.onCellData === 'function'){
            result = defaults.onCellData($cell, rowIndex, colIndex, result);
          }
        }

        return result;
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
    
      return this;
    }
  });
})(jQuery);
