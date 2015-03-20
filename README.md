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

for PNG export add:<BR>

&lt;script type="text/javascript" src="libs/html2canvas/html2canvas.min.js">&lt;/script><BR>

for PDF export add:<BR>

&lt;script type="text/javascript" src="libs/html2canvas/html2canvas.min.js">&lt;/script><BR>
&lt;script type="text/javascript" src="libs/jsPDF/jspdf.min.js">&lt;/script><BR>

Usage
=====
onClick ="$('#tableID').tableExport({type:'csv'});"<BR>

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
pdfLeftMargin: 20<BR>
escape: 'false'<BR>
htmlContent: 'false'<BR>
consoleLog: 'false'<BR>
outputMode: 'file'<BR>
fileName: 'tableExport'<BR>
excelstyles: ['css','properties','to','export','to','excel']<BR>
worksheetName: 'xlsWorksheetName'<BR>

Optional html data attributes 
=============================
(can be set while generating the table you want to export)

&lt;td data-tableexport-display="none">...&lt;/td> -> cell will not be exported
