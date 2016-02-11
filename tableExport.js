/*
 tableExport.jquery.plugin

 Copyright (c) 2015 hhurz, https://github.com/hhurz/tableExport.jquery.plugin

 Original work Copyright (c) 2014 Giri Raj, https://github.com/kayalshri/
 Licensed under the MIT License, http://opensource.org/licenses/mit-license
*/

(function ($) {
  $.fn.extend({
    tableExport: function (options) {
      var defaults = {
        consoleLog: false,
        csvEnclosure: '"',
        csvSeparator: ',',
        csvUseBOM: true,
        displayTableName: false,
        escape: false,
        excelstyles: ['border-bottom', 'border-top', 'border-left', 'border-right'],
        fileName: 'tableExport',
        htmlContent: false,
        ignoreColumn: [],
        ignoreRow:[],
        jspdf: {orientation: 'p',
                unit: 'pt',
                format: 'a4', // jspdf page format or 'bestfit' for autmatic paper format selection
                margins: {left: 20, right: 10, top: 10, bottom: 10},
                autotable: {styles: {cellPadding: 2,
                                     rowHeight: 12,
                                     fontSize: 8,
                                     fillColor: 255,        // color value or 'inherit' to use css background-color from html table
                                     textColor: 50,         // color value or 'inherit' to use css color from html table
                                     fontStyle: 'normal',   // normal, bold, italic, bolditalic or 'inherit' to use css font-weight and fonst-style from html table
                                     overflow: 'ellipsize', // visible, hidden, ellipsize or linebreak
                                     halign: 'left',        // left, center, right
                                     valign: 'middle'       // top, middle, bottom
                                    },
                            headerStyles: {fillColor: [52, 73, 94],
                                           textColor: 255,
                                           fontStyle: 'bold',
                                           halign: 'center'
                                          },
                            alternateRowStyles: {fillColor: 245
                                                },
                            tableExport: {onAfterAutotable: null,
                                          onBeforeAutotable: null,
                                          onTable: null
                                         }
                           }
               },
        numbers: {html: {decimalMark: '.',
                         thousandsSeparator: ','
                        },
                  output: {decimalMark: '.',
                           thousandsSeparator: ','
                          }
                 },
        onCellData: null,
        onCellHtmlData: null,
        outputMode: 'file', // 'file', 'string' or 'base64'
        tbodySelector: 'tr',
        theadSelector: 'tr',
        tableName: 'myTableName',
        type: 'csv', // 'csv', 'txt', 'sql', 'json', 'xml', 'excel', 'doc', 'png' or 'pdf'
        worksheetName: 'xlsWorksheetName'
      };

      var FONT_ROW_RATIO = 1.15;
      var el = this;
      var DownloadEvt = null;
      var $hrows = [];
      var $rows = [];
      var rowIndex = 0;
      var rowspans = [];
      var trData = '';

      $.extend(true, defaults, options);

      if (defaults.type == 'csv' || defaults.type == 'txt') {

        var csvData = "";
        var rowlength = 0;
        rowIndex = 0;

        function CollectCsvData (tgroup, tselector, rowselector, length) {

          $rows = $(el).find(tgroup).first().find(tselector);
          $rows.each(function () {
            trData = "";
            ForEachVisibleCell(this, rowselector, rowIndex, length + $rows.length,
                    function (cell, row, col) {
                      trData += csvString(cell, row, col) + defaults.csvSeparator;
                    });
            trData = $.trim(trData).substring(0, trData.length - 1);
            if (trData.length > 0) {

              if (csvData.length > 0)
                csvData += "\n";

              csvData += trData;
            }
            rowIndex++;
          });

          return $rows.length;
        }

        rowlength += CollectCsvData ('thead', defaults.theadSelector, 'th,td', rowlength);
        rowlength += CollectCsvData ('tbody', defaults.tbodySelector, 'td', rowlength);
        CollectCsvData ('tfoot', defaults.tbodySelector, 'td', rowlength);

        csvData += "\n";

        //output
        if (defaults.consoleLog === true)
          console.log(csvData);

        if (defaults.outputMode === 'string')
          return csvData;

        if (defaults.outputMode === 'base64')
          return base64encode(csvData);

        try {
          var blob = new Blob([csvData], {type: "text/" + (defaults.type == 'csv' ? 'csv' : 'plain') + ";charset=utf-8"});
          saveAs(blob, defaults.fileName + '.' + defaults.type, (defaults.type != 'csv' || defaults.csvUseBOM === false));
        }
        catch (e) {
          downloadFile(defaults.fileName + '.' + defaults.type,
                       'data:text/' + (defaults.type == 'csv' ? 'csv' : 'plain') + ';charset=utf-8,' + ((defaults.type == 'csv' && defaults.csvUseBOM)? '\ufeff' : ''),
                       csvData);
        }

      } else if (defaults.type == 'sql') {

        // Header
        rowIndex = 0;
        var tdData = "INSERT INTO `" + defaults.tableName + "` (";
        $hrows = $(el).find('thead').first().find(defaults.theadSelector);
        $hrows.each(function () {
          ForEachVisibleCell(this, 'th,td', rowIndex, $hrows.length,
                  function (cell, row, col) {
                    tdData += "'" + parseString(cell, row, col) + "',";
                  });
          rowIndex++;
          tdData = $.trim(tdData);
          tdData = $.trim(tdData).substring(0, tdData.length - 1);
        });
        tdData += ") VALUES ";
        // Row vs Column
        $rows = $(el).find('tbody').first().find(defaults.tbodySelector);
        $rows.each(function () {
          trData = "";
          ForEachVisibleCell(this, 'td', rowIndex, $hrows.length + $rows.length,
                  function (cell, row, col) {
                    trData += "'" + parseString(cell, row, col) + "',";
                  });
          if (trData.length > 3) {
            tdData += "(" + trData;
            tdData = $.trim(tdData).substring(0, tdData.length - 1);
            tdData += "),";
          }
          rowIndex++;
        });

        tdData = $.trim(tdData).substring(0, tdData.length - 1);
        tdData += ";";

        //output
        if (defaults.consoleLog === true)
          console.log(tdData);

        if (defaults.outputMode === 'string')
          return tdData;

        if (defaults.outputMode === 'base64')
          return base64encode(tdData);

        try {
          var blob = new Blob([tdData], {type: "text/plain;charset=utf-8"});
          saveAs(blob, defaults.fileName + '.sql');
        }
        catch (e) {
          downloadFile(defaults.fileName + '.sql',
                       'data:application/sql;charset=utf-8,',
                       tdData);
        }

      } else if (defaults.type == 'json') {

        var jsonHeaderArray = [];
        $hrows = $(el).find('thead').first().find(defaults.theadSelector);
        $hrows.each(function () {
          var jsonArrayTd = [];

          ForEachVisibleCell(this, 'th,td', rowIndex, $hrows.length,
                  function (cell, row, col) {
                    jsonArrayTd.push(parseString(cell, row, col));
                  });
          jsonHeaderArray.push(jsonArrayTd);
        });

        var jsonArray = [];
        $rows = $(el).find('tbody').first().find(defaults.tbodySelector);
        $rows.each(function () {
          var jsonArrayTd = [];

          ForEachVisibleCell(this, 'td', rowIndex, $hrows.length + $rows.length,
                  function (cell, row, col) {
                    jsonArrayTd.push(parseString(cell, row, col));
                  });

          if (jsonArrayTd.length > 0 && (jsonArrayTd.length != 1 || jsonArrayTd[0] != ""))
            jsonArray.push(jsonArrayTd);

          rowIndex++;
        });

        var jsonExportArray = [];
        jsonExportArray.push({header: jsonHeaderArray, data: jsonArray});

        var sdata = JSON.stringify(jsonExportArray);

        if (defaults.consoleLog === true)
          console.log(sdata);

        if (defaults.outputMode === 'string')
          return sdata;

        if (defaults.outputMode === 'base64')
          return base64encode(sdata);

        try {
          var blob = new Blob([sdata], {type: "application/json;charset=utf-8"});
          saveAs(blob, defaults.fileName + '.json');
        }
        catch (e) {
          downloadFile(defaults.fileName + '.json',
                       'data:application/json;charset=utf-8;base64,',
                       sdata);
        }

      } else if (defaults.type === 'xml') {

        rowIndex = 0;
        var xml = '<?xml version="1.0" encoding="utf-8"?>';
        xml += '<tabledata><fields>';

        // Header
        $hrows = $(el).find('thead').first().find(defaults.theadSelector);
        $hrows.each(function () {

          ForEachVisibleCell(this, 'th,td', rowIndex, $rows.length,
                  function (cell, row, col) {
                    xml += "<field>" + parseString(cell, row, col) + "</field>";
                  });
          rowIndex++;
        });
        xml += '</fields><data>';

        // Row Vs Column
        var rowCount = 1;
        $rows = $(el).find('tbody').first().find(defaults.tbodySelector);
        $rows.each(function () {
          var colCount = 1;
          trData = "";
          ForEachVisibleCell(this, 'td', rowIndex, $hrows.length + $rows.length,
                  function (cell, row, col) {
                    trData += "<column-" + colCount + ">" + parseString(cell, row, col) + "</column-" + colCount + ">";
                    colCount++;
                  });
          if (trData.length > 0 && trData != "<column-1></column-1>") {
            xml += '<row id="' + rowCount + '">' + trData + '</row>';
            rowCount++;
          }

          rowIndex++;
        });
        xml += '</data></tabledata>';

        //output
        if (defaults.consoleLog === true)
          console.log(xml);

        if (defaults.outputMode === 'string')
          return xml;

        if (defaults.outputMode === 'base64')
          return base64encode(xml);

        try {
          var blob = new Blob([xml], {type: "application/xml;charset=utf-8"});
          saveAs(blob, defaults.fileName + '.xml');
        }
        catch (e) {
          downloadFile(defaults.fileName + '.xml',
                       'data:application/xml;charset=utf-8;base64,',
                       xml);
        }

      } else if (defaults.type == 'excel' || defaults.type == 'xls' || defaults.type == 'word' || defaults.type == 'doc') {

        var MSDocType = (defaults.type == 'excel' || defaults.type == 'xls') ? 'excel' : 'word';
        var MSDocExt = (MSDocType == 'excel') ? 'xls' : 'doc';
        var MSDocSchema = (MSDocExt == 'xls') ? 'xmlns:x="urn:schemas-microsoft-com:office:excel"' : 'xmlns:w="urn:schemas-microsoft-com:office:word"';
        var $tables = $('table');
        var docData = '';

        $tables.each(function(){
          rowIndex = 0;
          docData += '<table><thead>';
          // Header
          $hrows = $(this).find('thead').first().find(defaults.theadSelector);
          $hrows.each(function() {
            trData = "";
            ForEachVisibleCell(this, 'th,td', rowIndex, $hrows.length,
              function(cell, row, col) {
                if (cell != null) {
                  trData += '<th style="';
                  for (var styles in defaults.excelstyles) {
                    if (defaults.excelstyles.hasOwnProperty(styles)) {
                      trData += defaults.excelstyles[styles] + ': ' + $(cell).css(defaults.excelstyles[styles]) + ';';
                    }
                  }
                  if ($(cell).is("[colspan]"))
                    trData += '" colspan="' + $(cell).attr('colspan');
                  if ($(cell).is("[rowspan]"))
                    trData += '" rowspan="' + $(cell).attr('rowspan');
                  trData += '">' + parseString(cell, row, col) + '</th>';
                }
              });
            if (trData.length > 0)
              docData += '<tr>' + trData + '</tr>';
            rowIndex++;
          });

          docData += '</thead><tbody>';
          // Row Vs Column
          $rows = $(this).find('tbody').first().find(defaults.tbodySelector);
          $rows.each(function() {
            trData = "";
            ForEachVisibleCell(this, 'td', rowIndex, $hrows.length + $rows.length,
              function(cell, row, col) {
                if (cell != null) {
                  trData += '<td style="';
                  for (var styles in defaults.excelstyles) {
                    if (defaults.excelstyles.hasOwnProperty(styles)) {
                      trData += defaults.excelstyles[styles] + ': ' + $(cell).css(defaults.excelstyles[styles]) + ';';
                    }
                  }
                  if ($(cell).is("[colspan]"))
                    trData += '" colspan="' + $(cell).attr('colspan');
                  if ($(cell).is("[rowspan]"))
                    trData += '" rowspan="' + $(cell).attr('rowspan');
                  trData += '">' + parseString(cell, row, col) + '</td>';
                }
              });
            if (trData.length > 0)
              docData += '<tr>' + trData + '</tr>';
            rowIndex++;
          });

          if (defaults.displayTableName)
            docData += '<tr><td></td></tr><tr><td></td></tr><tr><td>' + parseString($('<p>' + defaults.tableName + '</p>')) + '</td></tr>';

          docData += '</tbody></table>';

          if (defaults.consoleLog === true)
            console.log(docData);
        });

        var docFile = '<html xmlns:o="urn:schemas-microsoft-com:office:office" ' + MSDocSchema + ' xmlns="http://www.w3.org/TR/REC-html40">';
        docFile += '<meta http-equiv="content-type" content="application/vnd.ms-' + MSDocType + '; charset=UTF-8">';
        docFile += "<head>";
        if (MSDocType === 'excel') {
          docFile += "<!--[if gte mso 9]>";
          docFile += "<xml>";
          docFile += "<x:ExcelWorkbook>";
          docFile += "<x:ExcelWorksheets>";
          docFile += "<x:ExcelWorksheet>";
          docFile += "<x:Name>";
          docFile += defaults.worksheetName;
          docFile += "</x:Name>";
          docFile += "<x:WorksheetOptions>";
          docFile += "<x:DisplayGridlines/>";
          docFile += "</x:WorksheetOptions>";
          docFile += "</x:ExcelWorksheet>";
          docFile += "</x:ExcelWorksheets>";
          docFile += "</x:ExcelWorkbook>";
          docFile += "</xml>";
          docFile += "<![endif]-->";
        }
        docFile += "</head>";
        docFile += "<body>";
        docFile += docData;
        docFile += "</body>";
        docFile += "</html>";

        if (defaults.consoleLog === true)
          console.log(docFile);

        if (defaults.outputMode === 'string')
          return docFile;

        if (defaults.outputMode === 'base64')
          return base64encode(docFile);

        try {
          var blob = new Blob([docFile], {type: 'application/vnd.ms-' + defaults.type});
          saveAs(blob, defaults.fileName + '.' + MSDocExt);
        }
        catch (e) {
          downloadFile(defaults.fileName + '.' + MSDocExt,
                       'data:application/vnd.ms-' + MSDocType + ';base64,',
                       docFile);
        }

      } else if (defaults.type == 'png') {
        html2canvas($(el)[0], {
          allowTaint: true,
          background: '#fff',
          onrendered: function (canvas) {

            var image = canvas.toDataURL();
            image = image.substring(22); // remove data stuff

            var byteString = atob(image);
            var buffer = new ArrayBuffer(byteString.length);
            var intArray = new Uint8Array(buffer);

            for (var i = 0; i < byteString.length; i++)
              intArray[i] = byteString.charCodeAt(i);

            if (defaults.consoleLog === true)
              console.log(byteString);

            if (defaults.outputMode === 'string')
              return byteString;

            if (defaults.outputMode === 'base64')
              return base64encode(image);

            try {
              var blob = new Blob([buffer], {type: "image/png"});
              saveAs(blob, defaults.fileName + '.png');
            }
            catch (e) {
              downloadFile(defaults.fileName + '.png',
                           'data:image/png;base64,',
                           image);
            }
          }
        });

      } else if (defaults.type == 'pdf') {
        if (defaults.jspdf.autotable === false) {
          var addHtmlOptions = {
            dim: {
              w: getPropertyUnitValue($(el).first().get(0), 'width', 'mm'),
              h: getPropertyUnitValue($(el).first().get(0), 'height', 'mm')
            },
            pagesplit: false
          };

          var doc = new jsPDF(defaults.jspdf.orientation, defaults.jspdf.unit, defaults.jspdf.format);
          doc.addHTML($(el).first(),
                  defaults.jspdf.margins.left,
                  defaults.jspdf.margins.top,
                  addHtmlOptions,
                  function () {
                    jsPdfOutput(doc);
                  });
          //delete doc;
        }
        else {
          // pdf output using jsPDF AutoTable plugin
          // https://github.com/simonbengtsson/jsPDF-AutoTable

          var teOptions = defaults.jspdf.autotable.tableExport;

          // When setting jspdf.format to 'bestfit' tableExport tries to choose
          // the minimum required paper format and orientation in which the table
          // (or tables in multitable mode) completely fits without column adjustment
          if (typeof defaults.jspdf.format === 'string' && defaults.jspdf.format.toLowerCase() === 'bestfit') {
            var pageFormats = {
              'a0': [2383.94, 3370.39], 'a1': [1683.78, 2383.94],
              'a2': [1190.55, 1683.78], 'a3': [841.89, 1190.55],
              'a4': [595.28, 841.89]
            };
            var rk = '', ro = '';
            var mw = 0;

            $(el).filter(':visible').each(function () {
              if ($(this).css('display') != 'none') {
                var w = getPropertyUnitValue($(this).get(0), 'width', 'pt');

                if (w > mw) {
                  if (w > pageFormats['a0'][0]) {
                    rk = 'a0';
                    ro = 'l';
                  }
                  for (var key in pageFormats) {
                    if (pageFormats.hasOwnProperty(key)) {
                      if (pageFormats[key][1] > w) {
                        rk = key;
                        ro = 'l';
                        if (pageFormats[key][0] > w)
                          ro = 'p';
                      }
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
          // thus it can be accessed from any callback function
          teOptions.doc = new jsPDF(defaults.jspdf.orientation,
                  defaults.jspdf.unit,
                  defaults.jspdf.format);

          $(el).filter(function() {
            return $(this).data("tableexport-display") != 'none' &&
                   ($(this).is(':visible') ||
                    $(this).data("tableexport-display") == 'always');
          }).each(function () {
            var colKey;
            var rowIndex = 0;

            teOptions.columns = [];
            teOptions.rows = [];
            teOptions.rowoptions = {};

            // onTable: optional callback function for every matching table that can be used
            // to modify the tableExport options or to skip the output of a particular table
            // if the table selector targets multiple tables
            if (typeof teOptions.onTable === 'function')
              if (teOptions.onTable($(this), defaults) === false)
                return true; // continue to next iteration step (table)

            // each table works with an own copy of AutoTable options
            defaults.jspdf.autotable.tableExport = null;  // avoid deep recursion error
            var atOptions = $.extend(true, {}, defaults.jspdf.autotable);
            defaults.jspdf.autotable.tableExport = teOptions;

            atOptions.margin = {};
            $.extend(true, atOptions.margin, defaults.jspdf.margins);
            atOptions.tableExport = teOptions;

            // Fix jsPDF Autotable's row height calculation
            if (typeof atOptions.beforePageContent !== 'function') {
              atOptions.beforePageContent = function (data) {
                if (data.pageCount == 1) {
                  var all = data.table.rows.concat(data.table.headerRow);
                  all.forEach(function (row) {
                    if ( row.height > 0 ) {
                      row.height += (2 - FONT_ROW_RATIO) / 2 * row.styles.fontSize;
                      data.table.height += (2 - FONT_ROW_RATIO) / 2 * row.styles.fontSize;
                    }
                  });
                }
              }
            }

            if (typeof atOptions.createdHeaderCell !== 'function') {
              // apply some original css styles to pdf header cells
              atOptions.createdHeaderCell = function (cell, data) {

                if (typeof teOptions.columns [data.column.dataKey] != 'undefined') {
                  var col = teOptions.columns [data.column.dataKey];
                  cell.styles.halign = col.style.align;
                  if (atOptions.styles.fillColor === 'inherit')
                    cell.styles.fillColor = col.style.bcolor;
                  if (atOptions.styles.textColor === 'inherit')
                    cell.styles.textColor = col.style.color;
                  if (atOptions.styles.fontStyle === 'inherit')
                    cell.styles.fontStyle = col.style.fstyle;
                }
              }
            }

            if (typeof atOptions.createdCell !== 'function') {
              // apply some original css styles to pdf table cells
              atOptions.createdCell = function (cell, data) {
                var rowopt = teOptions.rowoptions [data.row.index + ":" + data.column.dataKey];

                if ( typeof rowopt != 'undefined' && typeof rowopt.style != 'undefined' ) {
                  cell.styles.halign = rowopt.style.align;
                  if (atOptions.styles.fillColor === 'inherit')
                    cell.styles.fillColor = rowopt.style.bcolor;
                  if (atOptions.styles.textColor === 'inherit')
                    cell.styles.textColor = rowopt.style.color;
                  if (atOptions.styles.fontStyle === 'inherit')
                    cell.styles.fontStyle = rowopt.style.fstyle;
                }
              }
            }

            if (typeof atOptions.drawHeaderCell !== 'function') {
              atOptions.drawHeaderCell = function (cell, data) {
                var colopt = teOptions.columns [data.column.dataKey];

                if (colopt.style.hasOwnProperty("hidden") != true || colopt.style.hidden !== true)
                  return prepareAutoTableText (cell, data, colopt);
                else
                  return false; // cell is hidden
              }
            }

            if (typeof atOptions.drawCell !== 'function') {
              atOptions.drawCell = function (cell, data) {
                var rowopt = teOptions.rowoptions [data.row.index + ":" + data.column.dataKey];
                return prepareAutoTableText (cell, data, rowopt);
              }
            }

            // collect header and data rows
            $hrows = $(this).find('thead').find(defaults.theadSelector);
            $hrows.each(function () {
              colKey = 0;

              ForEachVisibleCell(this, 'th,td', rowIndex, $hrows.length,
                      function (cell, row, col) {
                        var obj = getCellStyles (cell);
                        obj.title = parseString(cell, row, col);
                        obj.key = colKey++;
                        teOptions.columns.push(obj);
                      });
              rowIndex++;
            });

            var rowCount = 0;
            $rows = $(this).find('tbody').find(defaults.tbodySelector);
            $rows.each(function () {
              var rowData = [];
              colKey = 0;

              ForEachVisibleCell(this, 'td', rowIndex, $hrows.length + $rows.length,
                      function (cell, row, col) {
                        if (typeof teOptions.columns[colKey] === 'undefined') {
                          // jsPDF-Autotable needs columns. Thus define hidden ones for tables without thead
                          var obj = {
                            title: '',
                            key: colKey,
                            style: {
                              hidden: true
                            }
                          };
                          teOptions.columns.push(obj);
                        }
                        if (cell !== null) {
                          teOptions.rowoptions [rowCount + ":" + colKey++] = getCellStyles (cell);
                        }
                        else {
                          var obj = $.extend(true, {}, teOptions.rowoptions [rowCount + ":" + (colKey-1)]);
                          obj.colspan = -1;
                          teOptions.rowoptions [rowCount + ":" + colKey++] = obj;
                        }

                        rowData.push(parseString(cell, row, col));
                      });
              if (rowData.length) {
                teOptions.rows.push(rowData);
                rowCount++
              }
              rowIndex++;
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
            defaults.jspdf.autotable.startY = teOptions.doc.autoTableEndPosY() + atOptions.margin.top;
          });

          jsPdfOutput(teOptions.doc);

          teOptions.columns.length = 0;
          teOptions.rows.length = 0;
          delete teOptions.doc;
          teOptions.doc = null;
        }
      }

      function ForEachVisibleCell(tableRow, selector, rowIndex, rowCount, cellcallback) {
        if ($.inArray(rowIndex, defaults.ignoreRow) == -1 &&
            $.inArray(rowIndex-rowCount, defaults.ignoreRow) == -1) {

          var $row = $(tableRow).filter(function() {
            return $(this).data("tableexport-display") != 'none' &&
                   ($(this).is(':visible') ||
                    $(this).data("tableexport-display") == 'always' ||
                    $(this).closest('table').data("tableexport-display") == 'always');
          }).find(selector);

          var rowColspan = 0;

          $row.each(function (colIndex) {
            if ($(this).data("tableexport-display") == 'always' ||
                ($(this).css('display') != 'none' &&
                 $(this).css('visibility') != 'hidden' &&
                 $(this).data("tableexport-display") != 'none')) {
              if ($.inArray(colIndex, defaults.ignoreColumn) == -1 &&
                  $.inArray(colIndex-$row.length, defaults.ignoreColumn) == -1) {
                if (typeof (cellcallback) === "function") {
                  var c, Colspan = 0;
                  var r, Rowspan = 0;

                  // handle rowspans from previous rows
                  if (typeof rowspans[rowIndex] != 'undefined' && rowspans[rowIndex].length > 0) {
                    for (c = 0; c <= colIndex; c++) {
                      if (typeof rowspans[rowIndex][c] != 'undefined') {
                        cellcallback(null, rowIndex, c);
                        delete rowspans[rowIndex][c];
                        colIndex++;
                      }
                    }
                  }

                  if ($(this).is("[colspan]")) {
                    Colspan = parseInt($(this).attr('colspan'));
                    rowColspan += Colspan > 0 ? Colspan - 1 : 0;
                  }

                  if ($(this).is("[rowspan]"))
                    Rowspan = parseInt($(this).attr('rowspan'));

                  // output content of current cell
                  cellcallback(this, rowIndex, colIndex);

                  // handle colspan of current cell
                  for (c = 0; c < Colspan - 1; c++)
                    cellcallback(null, rowIndex, colIndex + c);

                  // store rowspan for following rows
                  if (Rowspan) {
                    for (r = 1; r < Rowspan; r++) {
                      if (typeof rowspans[rowIndex + r] == 'undefined')
                        rowspans[rowIndex + r] = [];

                      rowspans[rowIndex + r][colIndex + rowColspan] = "";

                      for (c = 1; c < Colspan; c++)
                        rowspans[rowIndex + r][colIndex + rowColspan - c] = "";
                    }
                  }
                }
              }
            }
          });
        }
      }

      function jsPdfOutput(doc) {
        if (defaults.consoleLog === true)
          console.log(doc.output());

        if (defaults.outputMode === 'string')
          return doc.output();

        if (defaults.outputMode === 'base64')
          return base64encode(doc.output());

        try {
          var blob = doc.output('blob');
          saveAs(blob, defaults.fileName + '.pdf');
        }
        catch (e) {
          downloadFile(defaults.fileName + '.pdf',
                       'data:application/pdf;base64,',
                       doc.output());
        }
      }

      function prepareAutoTableText (cell, data, cellopt) {
        var cs = 0;
        if ( typeof cellopt != 'undefined' )
          cs = cellopt.colspan;

        if ( cs >= 0 ) {
          // colspan handling
          var cellWidth = cell.width;
          var textPosX = cell.textPos.x;
          var i = data.table.columns.indexOf(data.column);

          for (var c = 1; c < cs; c++) {
            var column = data.table.columns[i+c];
            cellWidth += column.width;
          }

          if ( cs > 1 ) {
            if ( cell.styles.halign === 'right' )
              textPosX = cell.textPos.x + cellWidth - cell.width;
            else if ( cell.styles.halign === 'center' )
              textPosX = cell.textPos.x + (cellWidth - cell.width) / 2;
          }

          cell.width = cellWidth;
          cell.textPos.x = textPosX;

          if ( typeof cellopt != 'undefined' && cellopt.rowspan > 1 )
          {
            if ( cell.styles.valign === 'middle' )
              cell.textPos.y = cell.textPos.y + (cell.height * (cellopt.rowspan - 1)) / 2;
            else if ( cell.styles.valign === 'bottom' )
              cell.textPos.y += (cellopt.rowspan - 1) * cell.height;

            cell.height = cell.height * cellopt.rowspan;
          }

          // fix jsPDF's calculation of text position
          if ( cell.styles.valign === 'middle' || cell.styles.valign === 'bottom' ) {
            var splittedText = typeof cell.text === 'string' ? cell.text.split(/\r\n|\r|\n/g) : cell.text;
            var lineCount = splittedText.length || 1;
            if (lineCount > 2)
              cell.textPos.y -= ((2 - FONT_ROW_RATIO) / 2 * data.row.styles.fontSize) * (lineCount-2) / 3 ;
          }
          return true;
        }
        else
          return false; // cell is hidden (colspan = -1), don't draw it
      }

      function escapeRegExp(string) {
        return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
      }

      function replaceAll(string, find, replace) {
        return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
      }

      // Takes a string and encapsulates it (by default in double-quotes) if it
      // contains the csv field separator, spaces, or linebreaks.
      function csvString(cell, rowIndex, colIndex) {
        var result = '';

        if (cell != null) {
          var dataString = parseString(cell, rowIndex, colIndex);

          var csvValue = (dataString === null || dataString == '') ? '' : dataString.toString();

          if (dataString instanceof Date)
            result = defaults.csvEnclosure + dataString.toLocaleString() + defaults.csvEnclosure;
          else {
            result = replaceAll(csvValue, defaults.csvEnclosure, defaults.csvEnclosure + defaults.csvEnclosure);

            if (result.indexOf(defaults.csvSeparator) >= 0 || /[\r\n ]/g.test(result))
              result = defaults.csvEnclosure + result + defaults.csvEnclosure;
          }
        }

        return result;
      }

      function parseNumber(value) {
        value = value || "0";
        value = replaceAll(value, defaults.numbers.html.decimalMark, '.');
        value = replaceAll(value, defaults.numbers.html.thousandsSeparator, '');

        return typeof value === "number" || jQuery.isNumeric(value) !== false ? value : false;
      }


      function parseString(cell, rowIndex, colIndex) {
        var result = '';

        if (cell != null) {
          var $cell = $(cell);
          var htmlData = $cell.html();

          if (typeof defaults.onCellHtmlData === 'function')
            htmlData = defaults.onCellHtmlData($cell, rowIndex, colIndex, htmlData);

          if (defaults.htmlContent === true) {
            result = $.trim(htmlData);
          }
          else {
            var text = htmlData.replace(/\n/g,'\u2028').replace(/<br\s*[\/]?>/gi, '\u2060');
            var obj = $('<div/>').html(text).contents();
            text = '';
            $.each(obj.text().split("\u2028"), function(i, v) {
              if (i > 0)
                text += " ";
              text += $.trim(v);
            });

            $.each(text.split("\u2060"), function(i, v) {
              if (i > 0)
                result += "\n";
              result += $.trim(v).replace(/\u00AD/g, ""); // remove soft hyphens
            });

            if (defaults.numbers.html.decimalMark != defaults.numbers.output.decimalMark ||
                defaults.numbers.html.thousandsSeparator != defaults.numbers.output.thousandsSeparator) {
              var number = parseNumber (result);

              if ( number !== false ) {
                var frac = ("" + number).split('.');
                if ( frac.length == 1 )
                  frac[1] = "";
                var mod = frac[0].length > 3 ? frac[0].length % 3 : 0;

                result = (number < 0 ? "-" : "") +
                         (defaults.numbers.output.thousandsSeparator ? ((mod ? frac[0].substr(0, mod) + defaults.numbers.output.thousandsSeparator : "") + frac[0].substr(mod).replace(/(\d{3})(?=\d)/g, "$1" + defaults.numbers.output.thousandsSeparator)) : frac[0]) +
                         (frac[1].length ? defaults.numbers.output.decimalMark + frac[1] : "");
              }
            }
          }

          if (defaults.escape === true) {
            result = escape(result);
          }

          if (typeof defaults.onCellData === 'function') {
            result = defaults.onCellData($cell, rowIndex, colIndex, result);
          }
        }

        return result;
      }

      function hyphenate(a, b, c) {
        return b + "-" + c.toLowerCase();
      }

      function rgb2array(rgb_string, default_result) {
        var re = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
        var bits = re.exec(rgb_string);
        var result = default_result;
        if (bits)
          result = [ parseInt(bits[1]), parseInt(bits[2]), parseInt(bits[3]) ];
        return result;
      }

      function getCellStyles (cell) {
        var a = getStyle(cell, 'text-align');
        var fw = getStyle(cell, 'font-weight');
        var fs = getStyle(cell, 'font-style');
        var f = '';
        if (a == 'start')
          a = getStyle(cell, 'direction') == 'rtl' ? 'right' : 'left';
        if (fw >= 700)
          f = 'bold';
        if (fs == 'italic')
          f += fs;
        if (f == '')
          f = 'normal';
        return {
          style: {
            align: a,
            bcolor: rgb2array(getStyle(cell, 'background-color'), [255, 255, 255]),
            color: rgb2array(getStyle(cell, 'color'), [0, 0, 0]),
            fstyle: f
          },
          colspan: (parseInt($(cell).attr('colspan')) || 0),
          rowspan: (parseInt($(cell).attr('rowspan')) || 0)
        };
      }

      // get computed style property
      function getStyle(target, prop) {
        try {
          if (window.getComputedStyle) { // gecko and webkit
            prop = prop.replace(/([a-z])([A-Z])/, hyphenate);  // requires hyphenated, not camel
            return window.getComputedStyle(target, null).getPropertyValue(prop);
          }
          if (target.currentStyle) { // ie
            return target.currentStyle[prop];
          }
          return target.style[prop];
        }
        catch (e) {
        }
        return "";
      }

      function getPropertyUnitValue(target, prop, unit) {
        var baseline = 100;  // any number serves

        var value = getStyle(target, prop);  // get the computed style value

        var numeric = value.match(/\d+/);  // get the numeric component
        if (numeric !== null) {
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

      function downloadFile(filename, header, data) {

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
              DownloadLink.href = header + base64encode(data);
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
      }

      function utf8Encode(string) {
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
