tableExport.jquery.plugin
=========================

Bugs Fix History (BUG修正清单)
===================
Bug 001

[FIXED]When export to excel table, there are some cells which have different column span, output is wrong. （表头宽度错误）

Bug 002

[FIXED]Chinese characters output wrong（中文输出乱码）

<h3>Export HTML Table to</h3>
<ul>
<li> JSON
<li> XML
<li> PNG
<li> CSV
<li> TXT
<li> SQL
<li> MS-Word
<li> Ms-Excel
<li> Ms-Powerpoint
<li> PDF
</ul>

Installation
============
jquery Plugin<BR>
&lt;script type="text/javascript" src="tableExport.js"><BR>
&lt;script type="text/javascript" src="jquery.base64.js"><BR>
<BR>
PNG Export
==========
&lt;script type="text/javascript" src="html2canvas.js">

PDF Export
==========
&lt;script type="text/javascript" src="jspdf/libs/sprintf.js"><BR>
&lt;script type="text/javascript" src="jspdf/jspdf.js"><BR>
&lt;script type="text/javascript" src="jspdf/libs/base64.js"><BR>

Usage
======
onClick ="$('#tableID').tableExport({type:'pdf',escape:'false'});"<BR>

Options
=======
separator: ','<BR>
ignoreColumn: [2,3],<BR>
tableName:'yourTableName'<BR>
type:'csv'<BR>
pdfFontSize:14<BR>
pdfLeftMargin:20<BR>
escape:'true'<BR>
htmlContent:'false'<BR>
consoleLog:'false' <BR>
