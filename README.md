tableExport.jquery.plugin
=========================

<h3>Export HTML Table to</h3>
<ul>
<li> CSV
<li> TXT
<li> JSON
<li> XML
<li> SQL
<li> XLS
<li> DOC
<li> PNG
<li> PDF
</ul>

Installation
============

To save the generatetd export files on client side include 

```javascript
<script type="text/javascript" src="libs/FileSaver/FileSaver.min.js"></script>
```

To export the table as a PDF file the following includes are required:

```javascript
<script type="text/javascript" src="libs/jsPDF/jspdf.min.js"></script>
<script type="text/javascript" src="libs/jsPDF-AutoTable/jspdf.plugin.autotable.js"></script>
```

To export the table in PNG format you need to include:

```javascript
<script type="text/javascript" src="libs/html2canvas/html2canvas.min.js"></script>
```

To generate the export file in the desired format finally include:

```javascript
<script type="text/javascript" src="tableExport.min.js"></script>
```

Please keep this include order.



Examples
========

```javascript
$('#tableID').tableExport({type:'csv'});
```

```javascript
$('#tableID').tableExport({type:'pdf',
                           jspdf: {orientation: 'p',
                                   margins: {left:20, top:10},
                                   autotable: false}
                          });
```

```javascript
$('#tableID').tableExport({type:'pdf',
                           jspdf: {orientation: 'l',
                                   format: 'a3',
                                   margins: {left:10, right:10, top:20, bottom:20},
                                   autotable: {styles: {fillColor: 'inherit', 
                                                        textColor: 'inherit'},
                                               tableWidth: 'auto'}
                          });
```

```javascript
function DoCellData(cell, row, col, data) {}
function DoBeforeAutotable(table, headers, rows, AutotableSettings) {}

$('table').tableExport({fileName: sFileName,
                        type: 'pdf',
                        jspdf: {format: 'bestfit',
                                margins: {left:20, right:10, top:20, bottom:20},
                                autotable: {styles: {overflow: 'linebreak'},
                                            tableWidth: 'wrap',
                                            tableExport: {onBeforeAutotable: DoBeforeAutotable,
                                                          onCellData: DoCellData}}}
                       });
```

Options
=======

```javascript
consoleLog: false
csvEnclosure: '"'
csvSeparator: ','
csvUseBOM: true
displayTableName: false
escape: false
excelstyles: [ 'css','properties','to','export','to','excel' ]
fileName: 'tableExport'
htmlContent: false
ignoreColumn: []
ignoreRow: []
jsonScope: 'all'
jspdf: orientation: 'p'
       unit:'pt'
       format: 'a4'
       margins: left: 20
                right: 10
                top: 10
                bottom: 10
       autotable: styles: cellPadding: 2
                          rowHeight: 12
                          fontSize: 8
                          fillColor: 255
                          textColor: 50
                          fontStyle: 'normal'
                          overflow: 'ellipsize'
                          halign: 'left'
                          valign: 'middle'
                  headerStyles: fillColor: [52, 73, 94]
                                textColor: 255
                                fontStyle: 'bold'
                                halign: 'center'
                  alternateRowStyles: fillColor: 245
                  tableExport: onAfterAutotable: null
                               onBeforeAutotable: null
                               onTable: null
numbers: html: decimalMark: '.'
               thousandsSeparator: ','
         output: decimalMark: '.',
                 thousandsSeparator: ','
onCellData: null
onCellHtmlData: null
outputMode: 'file'
tbodySelector: 'tr'
theadSelector: 'tr'
tableName: 'myTableName'
type: 'csv'
worksheetName: 'xlsWorksheetName'
```

For jspdf options see the documentation of [jsPDF](https://github.com/MrRio/jsPDF) and [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) resp.

There is an extended setting for ``` jsPDF option 'format' ```. Setting the option value to ``` 'bestfit' ``` lets the tableExport plugin try to choose the minimum required paper format and orientation in which the table (or tables in multitable mode) completely fits without column adjustment.

Also there is an extended setting for the ``` jsPDF-AutoTable options 'fillColor', 'textColor' and 'fontStyle'```. When setting these option values to ``` 'inherit' ``` the original css values for background and text color will be used as fill and text color while exporting to pdf. A css font-weight >= 700 results in a bold fontStyle and the italic css font-style will be used as italic fontStyle.

```ignoreColumn``` can be either an array of indexes (i.e. [0, 2]) or field names (i.e. ["id", "name"]).
* Indexes correspond to the position of the header elements `th` in the DOM starting at 0. (If the `th` elements are removed or added to the DOM, the indexes will be shifted so use the functionality wisely!)
* Field names should correspond to the values set on the "data-field" attribute of the header elements `th` in the DOM.

Optional html data attributes
=============================
(can be set while generating the table you want to export)

<h3>data-tableexport-display</h3>
```html
<table style="display:none;" data-tableexport-display="always">...</table> -> hidden table will be exported

<td style="display:none;" data-tableexport-display="always">...</td> -> hidden cell will be exported

<td data-tableexport-display="none">...</td> -> cell will not be exported

<tr data-tableexport-display="none">...</tr> -> all cells of this row will not be exported
```

<h3>data-tableexport-value</h3>
```html
<th data-tableexport-value="export title">title</th> -> "export title" instead of "title" will be exported

<td data-tableexport-value="export content">content</td> -> "export content" instead of "content" will be exported
```
