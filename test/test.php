<!DOCTYPE html>
<html>
<head>
	<title>QUnit Test Suite - jQuery.Class</title>
	<link rel="stylesheet" href="qunit/qunit.css" type="text/css" media="screen">
	<script type="text/javascript" src="qunit/qunit.js"></script>
    <script src="jquery.js" type="text/javascript"></script>
    <script src="../jquery.class<?php echo isset($_GET["a"]) ? $_GET["a"] : "" ?>.js" type="text/javascript"></script>
	<script type="text/javascript" src="test.js"></script>
</head>
<body>
	<h1 id="qunit-header">QUnit Test Suite - jQuery.Class</h1>
	<h2 id="qunit-banner"></h2>
	<div id="qunit-testrunner-toolbar"></div>
	<h2 id="qunit-userAgent"></h2>
	<ol id="qunit-tests"></ol>
	<div id="qunit-fixture"></div>
</body>
</html>
