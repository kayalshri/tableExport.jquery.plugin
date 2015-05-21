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
To export a html table in CSV,TXT,JSON,XML,SQL,XLS or DOC format include:<BR>

&lt;script type="text/javascript" src="tableExport.js">&lt;/script><BR>
&lt;script type="text/javascript" src="libs/FileSaver/FileSaver.min.js">&lt;/script><BR>

To export the table in PNG format additionally include:<BR>

&lt;script type="text/javascript" src="libs/html2canvas/html2canvas.min.js">&lt;/script><BR>

To export the table as a PDF file the following includes are required:<BR>

&lt;script type="text/javascript" src="libs/html2canvas/html2canvas.min.js">&lt;/script><BR>
&lt;script type="text/javascript" src="libs/jsPDF/jspdf.min.js">&lt;/script><BR>
&lt;script type="text/javascript" src="libs/jsPDF-AutoTable/jspdf.plugin.autotable.js">&lt;/script><BR>

Examples
========
$('#tableID').tableExport({type:'csv'});<BR>

$('#tableID').tableExport({type:'pdf',
                           jspdf: {orientation: 'p',
                                   margins: {left:20, top:10},
                                   autotable: false}
                          });<BR>

$('#tableID').tableExport({type:'pdf',
                           jspdf: {orientation: 'l',
                                   margins: {left:10, right:10, top:20, bottom:20},
                                   autotable: {extendWidth: false}
                          });<BR>

Options
=======
csvSeparator: ','<BR>
csvEnclosure: '"'<BR>
onCellData: null<BR>
ignoreColumn: []<BR>
displayTableName: 'false',<BR>
theadSelector: 'tr'<BR>
tbodySelector: 'tr'<BR>
tableName: 'myTableName'<BR>
type: 'csv'<BR>
jspdf: {}<BR>
escape: 'false'<BR>
htmlContent: 'false'<BR>
consoleLog: 'false'<BR>
outputMode: 'file'<BR>
fileName: 'tableExport'<BR>
excelstyles: ['css','properties','to','export','to','excel']<BR>
worksheetName: 'xlsWorksheetName'<BR>

For jspdf options see the documentation of [jsPDF](https://github.com/MrRio/jsPDF) and [jsPDF-AutoTable](https://github.com/someatoms/jsPDF-AutoTable) resp.

Optional html data attributes 
=============================
(can be set while generating the table you want to export)

&lt;td data-tableexport-display="none">...&lt;/td> -> cell will not be exported
