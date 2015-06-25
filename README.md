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
To export a html table in CSV, TXT, JSON, XML, SQL, XLS or DOC formats include:

```javascript
<script type="text/javascript" src="tableExport.min.js"></script>
<script type="text/javascript" src="libs/FileSaver/FileSaver.min.js"></script>
```

To export the table in PNG format additionally include :

```javascript
<script type="text/javascript" src="libs/html2canvas/html2canvas.min.js"></script>
```

To export the table as a PDF file the following includes are required :

```javascript
<script type="text/javascript" src="libs/html2canvas/html2canvas.min.js"></script>
<script type="text/javascript" src="libs/jsPDF/jspdf.min.js"></script>
<script type="text/javascript" src="libs/jsPDF-AutoTable/jspdf.plugin.autotable.js"></script>
```

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
                                   autotable: {extendWidth: true}
                          });
```

```javascript
function DoCellData(cell, row, col, data) {}
function DoBeforeAutotable(table, headers, rows, AutotableSettings) {}

$('table').tableExport({fileName: sFileName,
                        type: 'pdf',
                        jspdf: { format: 'bestfit',
                                 margins: {left:20, right:10, top:20, bottom:20},
                                 autotable: {extendWidth: false,
                                             overflow: 'linebreak',
                                             tableExport: {onBeforeAutotable: DoBeforeAutotable,
                                                           onCellData: DoCellData}}}
                       });
```

Options
=======

```javascript
csvSeparator: ','
csvEnclosure: '"'
consoleLog: false
displayTableName: false
escape: false
excelstyles: ['css','properties','to','export','to','excel']
fileName: 'tableExport'
htmlContent: false
ignoreColumn: []
jspdf: orientation: 'p'
       unit:'pt'
       format: 'bestfit'
       margins: { left: 20, right: 10, top: 10, bottom: 10 }
       autotable: padding: 2
                  lineHeight: 12
                  fontSize: 8
                  tableExport: onAfterAutotable: null
                               onBeforeAutotable: null
                               onTable: null
onCellData: null
outputMode: 'file'
tbodySelector: 'tr'
theadSelector: 'tr'
tableName: 'myTableName'
type: 'csv'
worksheetName: 'xlsWorksheetName'
```

For jspdf options see the documentation of [jsPDF](https://github.com/MrRio/jsPDF) and [jsPDF-AutoTable](https://github.com/someatoms/jsPDF-AutoTable) resp.

Optional html data attributes 
=============================
(can be set while generating the table you want to export)

```html
<td data-tableexport-display="none">...</td> -> cell will not be exported
```
