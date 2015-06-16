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
<script type="text/javascript" src="tableExport.js"></script>
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
                                   margins: {left:10, right:10, top:20, bottom:20},
                                   autotable: {extendWidth: false}
                          });
```

Options
=======

```javascript
csvSeparator: ','
csvEnclosure: '"'
onCellData: null
ignoreColumn: []
displayTableName: 'false'
theadSelector: 'tr'
tbodySelector: 'tr'
tableName: 'myTableName'
type: 'csv'
jspdf: {}
escape: 'false'
htmlContent: 'false'
consoleLog: 'false'
outputMode: 'file'
fileName: 'tableExport'
excelstyles: ['css','properties','to','export','to','excel']
worksheetName: 'xlsWorksheetName'
```

For jspdf options see the documentation of [jsPDF](https://github.com/MrRio/jsPDF) and [jsPDF-AutoTable](https://github.com/someatoms/jsPDF-AutoTable) resp.

Optional html data attributes 
=============================
(can be set while generating the table you want to export)

```html
<td data-tableexport-display="none">...</td> -> cell will not be exported
```
